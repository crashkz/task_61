import { createStore } from 'vuex'

const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/XruToWBXmylHCyWPYvePYpPW7r_rmbWs')

// web3 - npm version 1.8.2
const Web3 = require('web3')
const web3 = new Web3('wss://eth-goerli.g.alchemy.com/v2/XruToWBXmylHCyWPYvePYpPW7r_rmbWs')

import {ABI} from "@/contracts/Test.abi.js"
import {bytecode} from "@/contracts/Test.bin.js"

export default createStore({
    state: {
        blocks: [],
        provider: {},
        wallet: {
            address: "",
            chainId: "",
            chain: ""
        },
        contractAddress: "",
        txHash: ""
    },
    getters: {
    },
    mutations: {
        addBlock(state, newBlock){
            state.blocks.unshift(newBlock)
        }
    },
    actions: {
        async newBlockHeaders({commit}){
            provider.on('block', async blocknumber =>{
                let block = await provider.getBlock(blocknumber)
                let newBlock = {
                    number: block.number,
                    hash: block.hash
                }
                commit('addBlock', newBlock)
            })
        },
        async getBlock({commit}, blockNumberOrHash){
            if(! ethers.utils.isBytesLike(blockNumberOrHash)){
                blockNumberOrHash = Number(blockNumberOrHash)
            }
            return await provider.getBlock(blockNumberOrHash)
        },
        async getTransaction({commit}, transactionHash){
            return await provider.getTransaction(transactionHash)
        },
        async connectionWallet({state}){
            // проверяем, что есть метамаск и подключаем его
            if (typeof window.ethereum !== 'undefined') {
                console.log("Ethereum client installed!")
                if (ethereum.isMetaMask === true) {
                    console.log("Metamask installed")
                    if (ethereum.isConnected() !== true) {
                        console.log("Metamask is not conneted!")
                        await ethereum.enable()
                    }
                    console.log("Metamask connected!")
                }
                else{
                    alert("Metamask is not installed!")
                }
            }
            else{
                alert("Etherium client is not installed!")
            }
            // подключаем аккаунт
            await ethereum.request({method: "eth_requestAccounts"})
            .then(accounts => {
                state.wallet.address = accounts[0]
                console.log(`Account ${state.wallet.address} connected`)
            })
            // создаём провайдера
            state.provider = new ethers.providers.Web3Provider(ethereum)
            // получаем параметры сети
            let network = await  state.provider.getNetwork()
            state.wallet.chainId = network.chainId
            state.wallet.chain = network.name

            // подписка на изменение аккаунта
            ethereum.on('accountsChanged', (accounts) => {
                state.wallet.address = accounts[0]
                console.log(`Accounts changed to ${state.wallet.address}`)
            })

            // подписка на изменение сети
            ethereum.on('chainChanged', async (chainId) => {
                state.provider = new ethers.providers.Web3Provider(ethereum)
                // получаем параметры сети
                let network = await state.provider.getNetwork()
                state.wallet.chainId = network.chainId
                state.wallet.chain = network.name
                console.log(`ChainId changed to ${state.wallet.chainId}`)
                console.log(`Chain changed to ${state.wallet.chain}`)
            })
        },
        async sendTransaction({state}, args) {
            let [to, value] = args
            value = ethers.BigNumber.from(value)
            value = value.toHexString()
            // value = ethers.utils.hexValue(value)

            await ethereum.request({
                method: "eth_sendTransaction", params: [{
                from: state.wallet.address,
                to: to,
                value: value
                }] 
            })
                .then(hash => {
                    console.log(`Tx hash ${hash}`)
                })
        },
        async deployContract({state}) {
            await ethereum.request({
                method: "eth_sendTransaction", params: [{
                from: state.wallet.address,
                data: bytecode
                }] 
            })
                .then(hash => {
                    console.log(`Tx hash ${hash}`)
            })

        },
        // число
        async setNumber({state}, args) {
            const [contractAddress, number] = args
            let iface = new ethers.utils.Interface(ABI)
            let txData = iface.encodeFunctionData("setNumber", [number])

            await ethereum.request({
                method: "eth_sendTransaction", params: [{
                from: state.wallet.address,
                to: contractAddress,
                data: txData
                }] 
            })
                .then(hash => {
                    state.txHash = hash
                    console.log(`Tx hash ${state.txHash}`)
            })
        },
        async getNumber({state}, contractAddress) {
            let myContract = new ethers.Contract(contractAddress, ABI, provider)
            let result = await myContract.getNumber()
            return result
        },
        // строка
        async setString({state}, args) {
            const [contractAddress, str] = args
            let myContract = new state.provider.eth.Contract(ABI, contractAddress)
            

            let txData = myContract.methods.setStr(str).encodeABI()

            await ethereum.request({
                method: "eth_sendTransaction", params: [{
                from: state.wallet.address,
                to: contractAddress,
                data: txData
                }] 
            })
                .then(hash => {
                    console.log(`Tx hash ${hash}`)
            })
        },
        async getString({state}, contractAddress) {
            let myContract = new state.provider.eth.Contract(ABI, contractAddress)
            let string = await myContract.methods.getStr().call({from: state.wallet.address})
            return string
        },
        // Масив чисел
        async setArray({state}, args) {
            const [contractAddress, arr] = args
            let myContract = new state.provider.eth.Contract(ABI, contractAddress)
            

            let txData = myContract.methods.setArray(arr).encodeABI()

            await ethereum.request({
                method: "eth_sendTransaction", params: [{
                from: state.wallet.address,
                to: contractAddress,
                data: txData
                }] 
            })
                .then(hash => {
                    console.log(`Tx hash ${hash}`)
            })
        },
        async getArray({state}, contractAddress) {
            let myContract = new state.provider.eth.Contract(ABI, contractAddress)
            let array = await myContract.methods.getArray().call({from: state.wallet.address})
            return array
        }
    },
    modules: {
    }
    })
