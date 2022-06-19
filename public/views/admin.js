App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3()
        // await App.loadAccount()
        await App.loadContract()
        await App.render()
        // App.error_hendle()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                App.accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                // Acccounts now exposed
                console.log(App.accounts);

            } catch (error) {
                // User denied account access...
                // window.alert(error["message"]);
                window.alert(error);
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({ 'from': App.account })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    // loadAccount: async () => {
    //     // Set the current blockchain account
    //     App.accounts = await ethereum.request({ method: 'eth_accounts' })
    //     console.log(ethereum.selectedAddress)
    // },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const e_vot = await $.getJSON('./json/E_voting_system.json')
        App.contracts.E_vot = TruffleContract(e_vot);
        App.contracts.E_vot.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.e_vot = await App.contracts.E_vot.deployed()
    },

    add_prop_fun: async () => {
        const name = $('#Proposal').val()
        const party = $('#Party_list').val()
        const area = $('#Area_list_2').val()
        console.log(name, party, area);
        web3.eth.getBalance(ethereum.selectedAddress, (err, balance) => {
            if (err) {
                window.alert("Somthing went wrong");
                window.location("/admin");
            }
            this.balance = web3.utils.fromWei(balance, "ether")
        });
        if (!name || !party || !area) {
            window.alert("Enter Valid Input")
        }
        else if (this.balance != '0') {
            try {
                // web3.eth.sendTransaction({ 'from': App.accounts[0] })
                await App.e_vot.addProposal(name, party, area, { 'from': ethereum.selectedAddress }).then(console.log);
            }
            catch (error) {
                error = json(error);
                index = error.indexOf("Reason given:");
                index += 13;
                submsg = error.substring(index, error.length - 1);
                window.alert(submsg);
                console.log(submsg);
            }
        }
        else {
            window.alert("You don't have suficenent balance");
        }
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        // console.log(loader);
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.removeClass('d-flex')
            content.hide()
        } else {
            loader.hide()
            content.addClass('d-flex')
        }
    },
    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        // $('#account').html(App.account)

        // Add events Tasks

        // Update loading state
        App.setLoading(false)
    },
    // error_hendle: () => {
    //     chrome.runtime.onMessage.addListener(function (rq, sender, sendResponse) {
    //         // setTimeout to simulate any callback (even from storage.sync)
    //         setTimeout(function () {
    //             sendResponse({ status: true });
    //         }, 1);
    //         // return true;  // uncomment this line to fix error
    //     });
    // }
    to_string: (hex) => {
        var str = '';
        for (var n = 2; n < hex.length; n += 2) {
            // console.log(parseInt(hex.substr(n, 2), 16))
            dec = parseInt(hex.substr(n, 2), 16);
            if (dec) {
                str += String.fromCharCode(dec)
            }
            else {
                break
            }
        }
        return str;
    },
    get_prop: async () => {
        area = $('#Area_list_1').val()
        if (!area) {
            window.alert("select a valid area")
        }
        else {
            App.setLoading(true)
            App.proposals = await App.e_vot.getProposal(area)
            prop_tbody = $('#proposal_tb')
            prop_tbody.empty()
            for (i = 0; i < App.proposals.length; i++) {
                tr = $("<tr></tr>")
                th = $("<th></th>").text(i + 1)
                th.attr("scope", "row")
                td_name = $("<td></td>").text(App.to_string(App.proposals[i]["name"]))
                td_party = $("<td></td>").text(App.to_string(App.proposals[i]["party"]))
                td_vcount = $("<td></td>").text(App.proposals[i]["voteCount"])
                tr.append(th, td_name, td_party, td_vcount)
                prop_tbody.append(tr)
            }
            console.log(App.proposals[0])
            App.setLoading(false)
        }
    }
}

$(() => {
    $(window).on('load', App.load);
})

const add_prop = document.getElementById("prop_add")
console.log(add_prop)
add_prop.addEventListener("click", App.add_prop_fun);

const show_prop = document.getElementById("Show_prop")
console.log(show_prop)
show_prop.addEventListener("click", App.get_prop);
