import { expect } from "chai";
import { ethers } from "hardhat";

describe("Voting Contract", function () {
  let Voting;
  let voting: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  it("Should register voters", async function () {
    await voting.registerVoter(addr1.address);
    const voter = await voting.voters(addr1.address);
    expect(voter.isRegistered).to.be.true;
  });

  it("Should start proposals registration", async function () {
    await voting.startProposalsRegistration();
    expect(await voting.workflowStatus()).to.equal(1); // ProposalsRegistrationStarted
  });

  it("Should register proposals", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposal 1");
    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("Proposal 1");
  });

  it("Should allow voting", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    const proposal = await voting.proposals(0);
    expect(proposal.voteCount).to.equal(1);
  });

  it("Should tally votes and get winner", async function () {
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
    const winner = await voting.getWinner();
    expect(winner).to.equal("Proposal 1");
  });

  it("Should delegate vote", async function () {
    await voting.registerVoter(addr1.address);
    await voting.registerVoter(addr2.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).delegateVote(addr2.address);
    await voting.connect(addr2).vote(0);
    const proposal = await voting.proposals(0);
    expect(proposal.voteCount).to.equal(1);
  });

  it("Should withdraw proposal", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.connect(addr1).registerProposal("Proposal 1");
    await voting.connect(addr1).withdrawProposal(0);
    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("");
  });
});