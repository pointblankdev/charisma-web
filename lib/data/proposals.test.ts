import { addCachedProposal, getCachedProposals, getVoteData, removeCachedProposal, setVoteData } from "../db-providers/kv";
import { getProposals, getVotes } from "./proposals";

describe('proposals', () => {
  it('should get all proposals', async () => {
    const proposals = await getProposals();
    const props = proposals.filter((p: any) => p.tx.tx_status === 'success');
    const ccs = props.map((p: any) => p.tx.contract_call).filter((cc: any) => cc)
    console.log(ccs);
  })

  it('should get all votes', async () => {
    const proposalName = 'list-ten'
    const voteData = await getVotes(proposalName);
    const votes = voteData.filter((p: any) => p.tx.tx_status === 'success' && p.tx?.contract_call?.function_name === 'vote');
    const voteArgs = votes.map((v: any) => v.tx).map((tx: any) => ({
      proposal: tx.contract_call.function_args[2].repr,
      amount: tx.contract_call.function_args[0].repr,
      sender: tx.sender_address
    }));
    const tenVotes = voteArgs.filter((v: any) => v.proposal.includes(proposalName))
    // convert to map of address -> amount
    const voteMap = tenVotes.reduce((acc: any, vote: any) => {
      acc[vote.sender] = Number(acc[vote.sender] || 0) + Number(vote.amount.replace('u', '')) / 1000000;
      return acc;
    }, {});
    console.log(voteMap);
  })

  it('should get all proposals from cache', async () => {
    const proposals = await getCachedProposals();
    console.log(proposals)
  })

  it('set a proposal to cache', async () => {
    const resp = await addCachedProposal('test');
    console.log(resp)
  })

  it('remove a proposal from cache', async () => {
    const resp = await removeCachedProposal('test');
    console.log(resp)
  })

  it('should get vote data', async () => {
    const resp = await getVoteData('', '')
    console.log(resp)
  })

  it('should set vote data', async () => {
    const resp = await setVoteData('', '', { for: 10, against: 5 })
    console.log(resp)
  })
})