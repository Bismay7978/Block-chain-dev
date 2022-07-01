
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
                if (error.code != -32002)
                    window.alert(error.message);
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
        if (App.state === 0) {
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
                    await App.e_vot.addProposal(name, party, area, { 'from': ethereum.selectedAddress }).then((transaction) => {
                        if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                            window.alert('Proposal added successfully')
                        }
                        else {
                            window.alert('Getting some Error please try again\n' + String(transaction))
                        }
                        console.log(transaction.tx)
                    }).catch((error) => {
                        console.log(error['message'])
                        error = String(error)
                        idx = error.indexOf('.')
                        js = JSON.parse(error.substring(idx + 1, error.length))
                        window.alert(js.message)
                        console.log(js)
                    })
                    // console.log(ad_prop)
                }
                catch (error) {
                    window.alert(error);
                    console.log(error);
                }
            }
            else {
                window.alert("You don't have suficenent balance");
            }
        }
        else {
            window.alert("Registration fhase is over")
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
    get_unauth_voters: async () => {
        App.unauth_voters = await App.e_vot.unauth_voters()
        // console.log(App.unauth_voters[1].length + "v")
    },
    load_unauth_voters: async () => {
        App.state = await App.e_vot.check_state()
        App.state = App.state.toNumber()
        console.log(App.state)
        if (App.state === 0) {
            App.get_unauth_voters()
            // for (i = 0; i < App.unauth_voters[1].length; i++) {
            //     if (!App.unauth_voters[1][i].is_authorized) {
            //         adress = $("<label></label>")
            //         div = $("<div></div>")
            //         btn_ap = $("<button></button>")
            //         btn_rej = $("<button></button>")
            //         div.addClass("reg_vot mt-2 p-2")
            //         div.attr('id', i)
            //         adress.addClass("voter_address")
            //         adress.text(App.unauth_voters[0][i])
            //         btn_ap.addClass("btn btn-success voter_approve_btn ml-2")
            //         btn_ap.text(Approve)
            //         btn_rej.addClass("btn btn-danger voter_reject ml-2")
            //         btn_rej.text(Reject)
            //         div.append(adress, btn_ap, btn_rej)
            //         container = $('#register')
            //         container.append(div)
            //     }
            // }
        }
    },
    load_result: async () => {
        console.log(App.state)
        area = $(Area_list_3).val()
        if (!area) {
            window.alert("Please select valid area")
        }
        else {
            if (App.state === 3) {
                winer = await App.e_vot.winnerNME_Vcount(area)
                wn_tbody = $('#winer_tb')
                wn_tbody.empty()
                tr = $("<tr></tr>")
                th = $("<th></th>").text(i + 1)
                th.attr("scope", "row")
                td_name = $("<td></td>").text(App.to_string(winer["name"]))
                td_party = $("<td></td>").text(App.to_string(winer["party"]))
                td_vcount = $("<td></td>").text(winer["voteCount"])
                tr.append(th, td_name, td_party, td_vcount)
                wn_tbody.append(tr)
            }
            else {
                window.alert("voting phase not ended yet")
            }

        }
    }
    ,
    load_state: async () => {
        lable_state = $('#sts')
        console.log(lable_state)
        console.log(App.state)
        lable_state.empty()
        switch (App.state) {
            case 0:
                lable_state.text("Registration")
                break
            case 1:
                lable_state.text("Validation")
                break
            case 2:
                lable_state.text("Voting")
                break
            case 3:
                lable_state.text("Voting is closed")
        }
    }
    ,
    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)
        await App.load_unauth_voters()
        console.log(App.state)
        await App.load_state()
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
            proposals = await App.e_vot.getProposal(area)
            prop_tbody = $('#proposal_tb')
            prop_tbody.empty()
            for (i = 0; i < proposals.length; i++) {
                tr = $("<tr></tr>")
                th = $("<th></th>").text(i + 1)
                th.attr("scope", "row")
                td_name = $("<td></td>").text(App.to_string(proposals[i]["name"]))
                td_party = $("<td></td>").text(App.to_string(proposals[i]["party"]))
                td_vcount = $("<td></td>").text(proposals[i]["voteCount"])
                tr.append(th, td_name, td_party, td_vcount)
                prop_tbody.append(tr)
            }
            console.log(proposals[0])
            App.setLoading(false)
        }
    },
    change_state: async () => {
        App.setLoading(true)
        try {
            test = await App.e_vot.changeState({ 'from': ethereum.selectedAddress }).then((transaction) => {
                if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                    window.alert('Phase change successfully')
                }
                else {
                    window.alert('Getting some Error please try again\n' + String(transaction))
                }
                console.log(transaction.tx)
            }).catch((error) => {
                console.log(error['message'])
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })
            console.log(test)
            App.state = await App.e_vot.check_state()
            App.state = App.state.toNumber()
            console.log(App.state)
            await App.load_state()
        }
        catch (error) {
            console.log(error['message'])
            window.alert(error['message'])
        }
        App.setLoading(false)
    }
}

$(() => {
    $(window).on('load', App.load);
})

const add_prop = document.getElementById("prop_add")
console.log(add_prop)
add_prop.addEventListener("click", App.add_prop_fun)

const show_prop = document.getElementById("Show_prop")
console.log(show_prop)
show_prop.addEventListener("click", App.get_prop)

const btn_state = document.getElementById("btn_sts")
console.log(btn_state)
btn_state.addEventListener("click", App.change_state)

const btn_res = document.getElementById("Show_res")
console.log(btn_res)
btn_res.addEventListener("click", App.load_result)