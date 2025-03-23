const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    voting = await Voting.deploy();
  });

  describe("registerVoter", function () {
    it("Should register a voter", async function () {
      await voting.registerVoter(addr1.address);
      expect((await voting.voters(addr1.address)).isRegistered).to.be.true;
    });

    it("Should emit VoterRegistered event", async function () {
      await expect(voting.registerVoter(addr1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(addr1.address);
    });

    it("Should revert if the voter is already registered", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.registerVoter(addr1.address)).to.be.revertedWith("You are already registered");
    });

    it("Should revert if the workflow status is not RegisteringVoters", async function () {
      await voting.startProposalsRegistration();
      await expect(voting.registerVoter(addr1.address)).to.be.revertedWith("Workflow status not Registering voters");
    });
  });

  describe("removeVoter", function () {
    it("Should remove a registered voter", async function () {
      await voting.registerVoter(addr1.address);
      expect((await voting.voters(addr1.address)).isRegistered).to.be.true;

      await voting.removeVoter(addr1.address);
      expect((await voting.voters(addr1.address)).isRegistered).to.be.false;
    });

    it("Should emit VoterRemoved event", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.removeVoter(addr1.address))
        .to.emit(voting, "VoterRemoved")
        .withArgs(addr1.address);
    });

    it("Should revert if the voter is not registered", async function () {
      await expect(voting.removeVoter(addr1.address)).to.be.revertedWith("Voter is not registered");
    });

    it("Should revert if the workflow status is not RegisteringVoters", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await expect(voting.removeVoter(addr1.address)).to.be.revertedWith("Workflow status not Registering voters");
    });
  });

  describe("registerProposal", function () {
    it("Should register a proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      expect((await voting.proposals(0)).description).to.equal("Proposal 1");
    });

    it("Should emit ProposalRegistered event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await expect(voting.connect(addr1).registerProposal("Proposal 1"))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(0);
    });

    it("Should revert if the workflow status is not ProposalsRegistrationStarted", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.connect(addr1).registerProposal("Proposal 1")).to.be.revertedWith("Cannot add proposals now");
    });

    it("Should revert if the voter is not registered", async function () {
      await voting.startProposalsRegistration();
      await expect(voting.connect(addr1).registerProposal("Proposal 1")).to.be.revertedWith("You are not registered");
    });
  });

  describe("withdrawProposal", function () {
    it("Should withdraw a proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.connect(addr1).withdrawProposal(0);
      expect((await voting.proposals(0)).description).to.equal("");
    });

    it("Should emit ProposalWithdrawn event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await expect(voting.connect(addr1).withdrawProposal(0))
        .to.emit(voting, "ProposalWithdrawn")
        .withArgs(0);
    });

    it("Should revert if the workflow status is not ProposalsRegistrationStarted", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.connect(addr1).withdrawProposal(0)).to.be.revertedWith("Proposals registration is not open");
    });

    it("Should revert if the voter is not registered", async function () {
      await voting.startProposalsRegistration();
      await expect(voting.connect(addr1).withdrawProposal(0)).to.be.revertedWith("You are not registered");
    });

    it("Should revert if the proposal ID is invalid", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await expect(voting.connect(addr1).withdrawProposal(1)).to.be.revertedWith("Invalid proposal ID");
    });
  });

  describe("removeProposal", function () {
    it("Should remove a proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.removeProposal(0);
      expect((await voting.proposals(0)).description).to.equal("");
    });

    it("Should emit ProposalRemoved event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await expect(voting.removeProposal(0))
        .to.emit(voting, "ProposalRemoved")
        .withArgs(0);
    });

    it("Should revert if the workflow status is not ProposalsRegistrationStarted", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.removeProposal(0)).to.be.revertedWith("Proposals registration is not open");
    });

    it("Should revert if the proposal ID is invalid", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await expect(voting.removeProposal(1)).to.be.revertedWith("Invalid proposal ID");
    });
  });

  describe("vote", function () {
    it("Should vote for a proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      expect((await voting.proposals(0)).voteCount).to.equal(1);
    });

    it("Should emit Voted event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await expect(voting.connect(addr1).vote(0))
        .to.emit(voting, "Voted")
        .withArgs(addr1.address, 0);
    });

    it("Should revert if the workflow status is not VotingSessionStarted", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting session is not open");
    });

    it("Should revert if the voter is not registered", async function () {
      await voting.registerVoter(addr1.address); // Ensure at least one voter is registered
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await expect(voting.connect(addr2).vote(0)).to.be.revertedWith("You are not registered");
    });

    it("Should revert if the voter has already voted", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("You have already voted");
    });

    it("Should revert if the proposal ID is invalid", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("Invalid proposal ID");
    });
  });

  describe("delegateVote", function () {
    it("Should delegate a vote", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.connect(addr1).delegateVote(addr2.address);
      expect((await voting.voters(addr1.address)).delegate).to.equal(addr2.address);
    });

    it("Should emit VoteDelegated event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await expect(voting.connect(addr1).delegateVote(addr2.address))
        .to.emit(voting, "VoteDelegated")
        .withArgs(addr1.address, addr2.address);
    });

    it("Should revert if the voter is not registered", async function () {
      await expect(voting.delegateVote(addr2.address)).to.be.revertedWith("You are not registered");
    });

    it("Should revert if the voter has already voted", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).delegateVote(addr2.address)).to.be.revertedWith("You have already voted");
    });

    it("Should revert if the delegate is not a registered voter", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.connect(addr1).delegateVote(addr2.address)).to.be.revertedWith("Delegate is not a registered voter");
    });

    it("Should revert if the delegate is the voter themselves", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.connect(addr1).delegateVote(addr1.address)).to.be.revertedWith("Self-delegation is not allowed");
    });
  });

  describe("tallyVotes", function () {
    it("Should tally votes and determine the winning proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.connect(addr2).registerProposal("Proposal 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);
      await voting.endVotingSession();
      await voting.tallyVotes();
      expect(await voting.winningProposalId()).to.equal(0);
    });

    it("Should emit WorkflowStatusChange event", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.connect(addr2).registerProposal("Proposal 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);
      await voting.endVotingSession();
      await expect(voting.tallyVotes())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(4, 5);
    });

    it("Should revert if the workflow status is not VotingSessionEnded", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.tallyVotes()).to.be.revertedWith("Voting session has not ended");
    });
  });

  describe("getWinner", function () {
    it("Should return the description of the winning proposal", async function () {
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).registerProposal("Proposal 1");
      await voting.connect(addr2).registerProposal("Proposal 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);
      await voting.endVotingSession();
      await voting.tallyVotes();
      expect(await voting.getWinner()).to.equal("Proposal 1");
    });

    it("Should revert if the votes have not been tallied yet", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.getWinner()).to.be.revertedWith("Votes have not been tallied yet");
    });
  });

  describe("getWorkflowStatus", function () {
    it("Should return the current workflow status", async function () {
      expect(await voting.getWorkflowStatus()).to.equal(0);
      await voting.startProposalsRegistration();
      expect(await voting.getWorkflowStatus()).to.equal(1);
    });
  });
});