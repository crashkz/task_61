import { createStore } from 'vuex'

const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/XruToWBXmylHCyWPYvePYpPW7r_rmbWs')


export default createStore({
    state: {
        blocks: []
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
        }
    },
    modules: {
    }
    })
