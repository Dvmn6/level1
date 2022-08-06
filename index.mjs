import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [ accAlice, accBob ] =
  await stdlib.newTestAccounts(2, startingBalance);
console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log(`Creating the NFT...`)
const theNTF = await stdlib.launchToken(accAlice, 'NIKE', 'NIKE', {supply: 1});
const nftInfo = {
  nftId: theNTF.id,
  numTickets: 5,
};

const outcome = ['BOB DID NOT WIN', 'BOB WON!!!']

await accBob.tokenAccept(nftInfo.nftId);

const commonInterface = {
  getNum: (numTickets) => {
    console.log(`Number of available raffle tickets: ${numTickets}`)
    const number = Math.floor(Math.random() * numTickets) + 1;
    return number;
  },
  seeResults: (n) => {
    if(n == 0){
      console.log(`${outcome[n]}`)
    }else console.log(`${outcome[n]}`)
  }
}

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    // implement Alice's interact object here
    ...commonInterface,
    startRaffle: () => {
      console.log(`Send NFT Raffle information to the backend`);
      return nftInfo;
    },
    seeHash: (hashValue) => {
      console.log(`Winning number Hash: ${hashValue}`);
    },
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    // implement Bob's interact object here
    ...commonInterface,
    showNum: (num) => {
      console.log(`Bob drew Raffle Number: ${num}`);
    },
    seeWinner: (value) => {
      console.log(`The winning number is: ${value}`)
    }
  }),
]);
const aliceAfter = await accAlice.balancesOf([theNTF.id]);
const bobAfter = await accBob.balancesOf([theNTF.id]);
console.log('Alice balance after the raffle',aliceAfter.toString(), theNTF.sym);
console.log('Bob balance after the raffle',bobAfter.toString(), theNTF.sym);
console.log('Goodbye, Alice and Bob!');