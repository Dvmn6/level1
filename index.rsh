'reach 0.1';

const amt = 1;

const commonInterface = {
  getNum: Fun([UInt], UInt),
  seeResults: Fun([UInt], Null),
};

export const main = Reach.App(() => {
  const A = Participant('Alice', {
    
    ...commonInterface,
    ...hasRandom,
    startRaffle: Fun([], Object({
        nftId: Token,
        numTickets: UInt,
      })
    ),
    seeHash: Fun([Digest], Null),
  });
  const B = Participant('Bob', {
    
    ...commonInterface,
    showNum: Fun([UInt], Null),
    seeWinner: Fun([UInt], Null),
  });
  init();

  A.only(() => {
    const {nftId, numTickets} = declassify(interact.startRaffle());
    const _winningNum = interact.getNum(numTickets);
    const [_commitA, _saltA] = makeCommitment(interact, _winningNum); 
    const commitA = declassify(_commitA);
  })
 
  A.publish(nftId, numTickets, commitA);
  A.interact.seeHash(commitA);
  commit();
  A.pay([[amt, nftId]]);
  commit();
  unknowable(B, A(_winningNum, _saltA));

 
  B.only(() => {
    const myNum = declassify(interact.getNum(numTickets));
    interact.showNum(myNum);
  });
  B.publish(myNum);
  commit();

  A.only(() => {
    const saltA = declassify(_saltA);
    const winningNum = declassify(_winningNum);
  })
  A.publish(saltA, winningNum);
  checkCommitment(commitA, saltA, winningNum);

  B.interact.seeWinner(winningNum);
  const results = (myNum == winningNum ? 1 : 0); 
  each([A, B], () => {
    interact.seeResults(results)
  });
  transfer(amt, nftId).to(results == 0 ? A:B);
  commit();
  
  exit();
});