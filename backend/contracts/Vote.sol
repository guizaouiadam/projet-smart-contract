// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting
 * @dev Implements voting process along with vote delegation
 */
contract Voting is Ownable {
    
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() Ownable(msg.sender) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposal;
        address delegate;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint public winningProposalId;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;
    WorkflowStatus public workflowStatus;

    event VoterRegistered(address voterAddress);
    event VoterRemoved(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event ProposalWithdrawn(uint proposalId);
    event ProposalRemoved(uint proposalId);
    event Voted(address voter, uint proposalId);
    event VoteDelegated(address from, address to);

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "You are not registered");
        _;
    }

    /**
     * @dev Allows a registered voter to delegate their vote to another voter.
     * @param to The address to which the vote is delegated.
     */
    function delegateVote(address to) external onlyRegisteredVoter {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(voters[to].isRegistered, "Delegate is not a registered voter");
        require(to != msg.sender, "Self-delegation is not allowed");

        voters[msg.sender].delegate = to;
        emit VoteDelegated(msg.sender, to);
    }

    /**
     * @dev Registers a voter by the owner.
     * @param _voter The address of the voter to be registered.
     */
    function registerVoter(address _voter) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Workflow status not Registering voters");
        require(!voters[_voter].isRegistered, "You are already registered");

        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    /**
     * @dev Removes a voter by the owner.
     * @param _voter The address of the voter to be removed.
     */
    function removeVoter(address _voter) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Workflow status not Registering voters");
        require(voters[_voter].isRegistered, "Voter is not registered");

        delete voters[_voter];
        emit VoterRemoved(_voter);
    }

    /**
     * @dev Starts the voter registration phase.
     */
    function startVoterRegistration() external onlyOwner {
        workflowStatus = WorkflowStatus.RegisteringVoters;
        emit WorkflowStatusChange(workflowStatus, WorkflowStatus.RegisteringVoters);
    }

    /**
     * @dev Starts the proposal registration phase.
     */
    function startProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Cannot start proposals registration now");
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Registers a proposal by a registered voter.
     * @param _description The description of the proposal.
     */
    function registerProposal(string memory _description) external onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Cannot add proposals now");
        proposals.push(Proposal({
            description: _description,
            voteCount: 0
        }));
        emit ProposalRegistered(proposals.length - 1);
    }

    /**
     * @dev Allows a registered voter to withdraw their proposal.
     * @param _proposalId The ID of the proposal to be withdrawn.
     */
    function withdrawProposal(uint _proposalId) external onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not open");
        require(_proposalId < proposals.length, "Invalid proposal ID");

        Proposal storage proposal = proposals[_proposalId];
        require(keccak256(abi.encodePacked(proposal.description)) != keccak256(abi.encodePacked("")), "Proposal already withdrawn");

        proposal.description = "";
        emit ProposalWithdrawn(_proposalId);
    }

    /**
     * @dev Removes a proposal by the owner.
     * @param _proposalId The ID of the proposal to be removed.
     */
    function removeProposal(uint _proposalId) external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not open");
        require(_proposalId < proposals.length, "Invalid proposal ID");

        Proposal storage proposal = proposals[_proposalId];
        require(keccak256(abi.encodePacked(proposal.description)) != keccak256(abi.encodePacked("")), "Proposal already removed");

        proposal.description = "";
        emit ProposalRemoved(_proposalId);
    }

    /**
     * @dev Ends the proposal registration phase.
     */
    function endProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not active");
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Starts the voting session.
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Cannot start voting session now");
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Allows a registered voter to vote for a proposal.
     * @param _proposalId The ID of the proposal to vote for.
     */
    function vote(uint _proposalId) external onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not open");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_proposalId < proposals.length, "Invalid proposal ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposal = _proposalId;
        proposals[_proposalId].voteCount += 1;
        emit Voted(msg.sender, _proposalId);
    }

    /**
     * @dev Ends the voting session.
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev Tally the votes and determine the winning proposal.
     */
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Voting session has not ended");

        uint winningVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Returns the description of the winning proposal.
     * @return description The description of the winning proposal.
     */
    function getWinner() external view returns (string memory description) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes have not been tallied yet");
        return proposals[winningProposalId].description;
    }

    /**
     * @dev Returns the current workflow status.
     * @return The current workflow status.
     */
    function getWorkflowStatus() external view returns (WorkflowStatus) {
        return workflowStatus;
    }

}