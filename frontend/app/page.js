'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { contractAddress } from '../constants/index'; // Updated import
import './styles.css';

import { useAccount } from 'wagmi'
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'

import { useState } from 'react';

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "ProposalRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "ProposalRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "ProposalWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "VoteDelegated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
    ],
    name: "VoterRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
    ],
    name: "VoterRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum Voting.WorkflowStatus",
        name: "previousStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum Voting.WorkflowStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "WorkflowStatusChange",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "delegateVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "endProposalsRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "endVotingSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWorkflowStatus",
    outputs: [
      {
        internalType: "enum Voting.WorkflowStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "registerProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_voter",
        type: "address",
      },
    ],
    name: "registerVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    name: "removeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_voter",
        type: "address",
      },
    ],
    name: "removeVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startProposalsRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startVoterRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startVotingSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tallyVotes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voters",
    outputs: [
      {
        internalType: "bool",
        name: "isRegistered",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "hasVoted",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "votedProposal",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "delegate",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "winningProposalId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    name: "withdrawProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "workflowStatus",
    outputs: [
      {
        internalType: "enum Voting.WorkflowStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default function Home() {
  const [voterAddress, setVoterAddress] = useState("");
  const [proposalDescription, setProposalDescription] = useState(""); // New state for proposal description
  const [voters, setVoters] = useState([]); // New state to store registered voters
  const [proposals, setProposals] = useState([]); // New state to store registered proposals
  const [selectedProposalId, setSelectedProposalId] = useState(null); // New state for selected proposal ID
  const [winner, setWinner] = useState(""); // New state to store the winner
  const { address, isConnected } = useAccount();

  const startVoterRegistration = async () => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "startVoterRegistration",
      });
      const { hash } = await writeContract(request);
      console.log("Voter registration started:", hash);
    } catch (error) {
      console.error("Error starting voter registration:", error);
    }
  };

  const startProposalsRegistration = async () => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "startProposalsRegistration",
      });
      const { hash } = await writeContract(request);
      console.log("Proposals registration started:", hash);
    } catch (error) {
      console.error("Error starting proposals registration:", error);
    }
  };

  const registerVoter = async () => {
    try {
      // Check the current workflow status
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus", // Updated function name
      });

      if (status !== 0) {
        // 0 corresponds to RegisteringVoters
        console.error("Workflow status is not RegisteringVoters");
        return;
      }

      // Check if the current account is the owner
      const owner = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "owner",
      });

      if (address !== owner) {
        console.error("Only the owner can register voters");
        return;
      }

      console.log("Preparing to register voter with address:", voterAddress);
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "registerVoter",
        args: [voterAddress],
      });
      console.log("Request prepared:", request);
      const { hash } = await writeContract(request);
      console.log("Voter registered:", hash);

      // Update the list of registered voters
      setVoters([...voters, voterAddress]);
    } catch (error) {
      console.error("Error registering voter:", error);
    }
  };

  const registerProposal = async () => {
    try {
      console.log("Preparing to register proposal with description:", proposalDescription);
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "registerProposal",
        args: [proposalDescription],
      });
      console.log("Request prepared:", request);
      const { hash } = await writeContract(request);
      console.log("Proposal registered:", hash);

      // Update the list of registered proposals
      setProposals([...proposals, proposalDescription]);
    } catch (error) {
      console.error("Error registering proposal:", error);
    }
  };

  const voteForProposal = async () => {
    try {
      // Check if the workflow status is VotingSessionStarted
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 3) {
        // 3 corresponds to VotingSessionStarted
        console.error("Voting session is not open");
        return;
      }

      console.log("Preparing to vote for proposal with ID:", selectedProposalId);
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "vote",
        args: [selectedProposalId],
      });
      console.log("Request prepared:", request);
      const { hash } = await writeContract(request);
      console.log("Voted for proposal:", hash);

      // Update the list of registered voters with the proposal they voted for
      setVoters(
        voters.map(voter => (voter === address ? `${voter} (Voted for Proposal ${selectedProposalId})` : voter))
      );
    } catch (error) {
      console.error("Error voting for proposal:", error);
    }
  };

  const getWinner = async () => {
    try {
      // Check if the workflow status is VotesTallied
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "workflowStatus", // Corrected function name
      });

      if (status !== 5) {
        // 5 corresponds to VotesTallied
        console.error("Votes have not been tallied yet");
        return;
      }

      const winnerDescription = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWinner",
      });

      console.log("Winner description:", winnerDescription.description || winnerDescription); // Log the entire response
      setWinner(winnerDescription.description || winnerDescription);
    } catch (error) {
      console.error("Error getting winner:", error);
    }
  };

  const startVotingSession = async () => {
    try {
      // Check if the workflow status is ProposalsRegistrationEnded
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 2) {
        // 2 corresponds to ProposalsRegistrationEnded
        console.error("Cannot start voting session now");
        return;
      }

      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "startVotingSession",
      });
      const { hash } = await writeContract(request);
      console.log("Voting session started:", hash);
    } catch (error) {
      console.error("Error starting voting session:", error);
    }
  };

  const endProposalsRegistration = async () => {
    try {
      // Check if the workflow status is ProposalsRegistrationStarted
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 1) {
        // 1 corresponds to ProposalsRegistrationStarted
        console.error("Proposals registration is not active");
        return;
      }

      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "endProposalsRegistration",
      });
      const { hash } = await writeContract(request);
      console.log("Proposals registration ended:", hash);
    } catch (error) {
      console.error("Error ending proposals registration:", error);
    }
  };

  const endVotingSession = async () => {
    try {
      // Check if the workflow status is VotingSessionStarted
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 3) {
        // 3 corresponds to VotingSessionStarted
        console.error("Voting session is not active");
        return;
      }

      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "endVotingSession",
      });
      const { hash } = await writeContract(request);
      console.log("Voting session ended:", hash);
    } catch (error) {
      console.error("Error ending voting session:", error);
    }
  };

  const tallyVotes = async () => {
    try {
      // Check if the workflow status is VotingSessionEnded
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 4) {
        // 4 corresponds to VotingSessionEnded
        console.error("Voting session has not ended");
        return;
      }

      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "tallyVotes",
      });
      const { hash } = await writeContract(request);
      console.log("Votes tallied:", hash);
    } catch (error) {
      console.error("Error tallying votes:", error);
    }
  };

  const removeVoter = async () => {
    try {
      // Check the current workflow status
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 0) {
        // 0 corresponds to RegisteringVoters
        console.error("Workflow status is not RegisteringVoters");
        return;
      }

      // Check if the current account is the owner
      const owner = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "owner",
      });

      if (address !== owner) {
        console.error("Only the owner can remove voters");
        return;
      }

      console.log("Preparing to remove voter with address:", voterAddress);
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "removeVoter",
        args: [voterAddress],
      });
      console.log("Request prepared:", request);
      const { hash } = await writeContract(request);
      console.log("Voter removed:", hash);

      // Update the list of registered voters
      setVoters(voters.filter(voter => voter !== voterAddress));
    } catch (error) {
      console.error("Error removing voter:", error);
    }
  };

  const removeProposal = async () => {
    try {
      // Check if the workflow status is ProposalsRegistrationStarted
      const status = await readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getWorkflowStatus",
      });

      if (status !== 1) {
        // 1 corresponds to ProposalsRegistrationStarted
        console.error("Proposals registration is not active");
        return;
      }

      console.log("Preparing to remove proposal with ID:", selectedProposalId);
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "removeProposal",
        args: [selectedProposalId],
      });
      console.log("Request prepared:", request);
      const { hash } = await writeContract(request);
      console.log("Proposal removed:", hash);

      // Update the list of registered proposals
      setProposals(proposals.filter((_, index) => index !== parseInt(selectedProposalId)));
      setSelectedProposalId(null); // Reset the selected proposal ID
    } catch (error) {
      console.error("Error removing proposal:", error);
    }
  };

  return (
    <>
      <ConnectButton />
      {isConnected ? (
        <div className="container">
          <h2>Start Voter Registration</h2>
          <button className="btn" onClick={startVoterRegistration}>
            Start Voter Registration
          </button>

          <h2>Start Proposals Registration</h2>
          <button className="btn" onClick={startProposalsRegistration}>
            Start Proposals Registration
          </button>

          <h2>End Proposals Registration</h2>
          <button className="btn" onClick={endProposalsRegistration}>
            End Proposals Registration
          </button>

          <h2>Start Voting Session</h2>
          <button className="btn" onClick={startVotingSession}>
            Start Voting Session
          </button>

          <h2>End Voting Session</h2>
          <button className="btn" onClick={endVotingSession}>
            End Voting Session
          </button>

          <h2>Tally Votes</h2>
          <button className="btn" onClick={tallyVotes}>
            Tally Votes
          </button>

          <h2>Register Voter</h2>
          <input
            type="text"
            placeholder="Voter Address"
            value={voterAddress}
            onChange={e => setVoterAddress(e.target.value)}
            className="input"
          />
          <button className="btn" onClick={registerVoter}>
            Register Voter
          </button>

          <h2>Remove Voter</h2>
          <input
            type="text"
            placeholder="Voter Address"
            value={voterAddress}
            onChange={e => setVoterAddress(e.target.value)}
            className="input"
          />
          <button className="btn" onClick={removeVoter}>
            Remove Voter
          </button>

          <h2>Register Proposal</h2>
          <input
            type="text"
            placeholder="Proposal Description"
            value={proposalDescription}
            onChange={e => setProposalDescription(e.target.value)}
            className="input"
          />
          <button className="btn" onClick={registerProposal}>
            Register Proposal
          </button>

          <h2>Registered Voters</h2>
          <ul className="list">
            {voters.map((voter, index) => (
              <li key={index} className="list-item">
                {voter}
              </li>
            ))}
          </ul>

          <h2>Registered Proposals</h2>
          <ul className="list">
            {proposals.map((proposal, index) => (
              <li key={index} className="list-item">
                {proposal}
              </li>
            ))}
          </ul>

          <h2>Vote for Proposal</h2>
          <select className="select" onChange={e => setSelectedProposalId(e.target.value)}>
            <option value="">Select Proposal</option>
            {proposals.map((proposal, index) => (
              <option key={index} value={index}>
                {proposal}
              </option>
            ))}
          </select>
          <button className="btn" onClick={voteForProposal}>
            Vote
          </button>

          <h2>Remove Proposal</h2>
          <select className="select" onChange={e => setSelectedProposalId(e.target.value)}>
            <option value="">Select Proposal</option>
            {proposals.map((proposal, index) => (
              <option key={index} value={index}>
                {proposal}
              </option>
            ))}
          </select>
          <button className="btn" onClick={removeProposal}>
            Remove Proposal
          </button>

          <h2>Winner</h2>
          <button className="btn" onClick={getWinner}>
            Get Winner
          </button>
          {winner && <p className="winner">The winning proposal is: {winner}</p>}
        </div>
      ) : (
        <p>Please connect your Wallet to our DApp.</p>
      )}
    </>
  );
}