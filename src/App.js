import "./App.css";
import { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load_contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);

  const [balance, setBalance] = useState(null);
  const [reload, shouldReload] = useState(false);

  const reloadEffect = () => shouldReload(!reload);
  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => setAccount(accounts[0]));
  };

  useEffect(() => {
    const loadProvider = async () => {
      let provider = null;
     

      // const provider = await detectEthereumProvider();
      // const contract = await loadContract("Funder", provider);
      // if (provider) {
      //   setAccountListener(provider);
      //   provider.request({ method: "eth_requestAccounts" });
      //   setWeb3Api({
      //     web3: new Web3(provider),
      //     provider,
      //     contract,
      //   });
      // } else {
      //   console.error("Please install MetaMask!", error);
      // }

      if (window.ethereum) {
        provider = window.ethereum;
        try {
          await provider.enable();
        } catch {
          console.error("User is not allowed");
        }
      } else if (window.web3) {
        provider = window.web3.currentProvider;
      } else if (!process.env.production) {
        provider = new Web3.providers.HttpProvider("http://localhost:8545");
      }
      const contract = await loadContract("FundTransfer", provider);
      setWeb3Api({
        web3: new Web3(provider),
        provider,
        contract,
      });
    };
    loadProvider();
  }, []);

  console.log(web3Api.web3);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    web3Api.web3 && getAccount();
  }, [web3Api.web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };
    web3Api.contract && loadBalance();
  }, [web3Api, reload]);

  useEffect(() => {
    const getAccountBalance = async () => {
      await web3Api.web3.eth.getBalance(account).then(function(result) {
        setAccountBalance(web3Api.web3.utils.fromWei(result, 'ether'));
      });
      
    };
    account && getAccountBalance();
  }, [web3Api.web3, account]);


  const transferFund = async () => {
    const { web3, contract } = web3Api;
    await contract.depositMoney({
      from: account,
      value: web3.utils.toWei("2", "ether"),
    });
    reloadEffect();
  };

  const withdrawFund = async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("1", "ether");
    await contract.withdrawMoney(withdrawAmount, {
      from: account,
    });
    reloadEffect();
  };

 



  return (
    <>
      <div class="card text-center">
        <div class="card-header">Transfer and Withdraw fund</div>
        <div class="card-body">
          <h5 class="card-title">Contract Balance: {balance} ETH </h5>
          <p class="card-text">
            Account Connected : {account ? account : "not connected"}
          </p>
          <p class="card-text">
            Account Balance : {accountBalance}
          </p>
          {/* <button
            type="button"
            class="btn btn-success"
            onClick={async () => {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              console.log(accounts);
            }}
          >
            Connect to metamask
          </button> */}
          &nbsp;
          <button type="button" class="btn btn-success " onClick={transferFund}>
            Transfer
          </button>
          &nbsp;
          <button type="button" class="btn btn-primary " onClick={withdrawFund}>
            Withdraw
          </button>
        </div>
        <div class="card-footer text-muted">GIIT Solutions</div>
      </div>
    </>
  );
}

export default App;
