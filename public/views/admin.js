
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
        App.unauth_voters = await App.e_vot.unauth_voters({ 'from': ethereum.selectedAddress }).catch(err => {
            console.log(error['message'])
            error = String(error)
            idx = error.indexOf('.')
            js = JSON.parse(error.substring(idx + 1, error.length))
            window.alert(js.message)
            console.log(js)
        })
        console.log(App.unauth_voters)
        // console.log(App.unauth_voters[1].length + "v")
    },
    reg_ph_btn_evnt: async () => {
        approve_btns = document.getElementsByClassName('voter_approve_btn')
        reject_btns = document.getElementsByClassName('voter_reject')
        show_btns = document.getElementsByClassName('show_dt')
        for (var i = 0; i < approve_btns.length; i++) {
            approve_btns[i].addEventListener("click", async function (i) {
                await App.e_vot.giveRightToVote(App.unauth_voters[0][i], { 'from': ethereum.selectedAddress }).then(transaction => {
                    if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                        window.alert('Rights for votering have been given to ' + App.unauth_voters[0][i] + " Account")
                        approve_btns[i].parentNode.remove()
                    }
                    else {
                        window.alert('Getting some Error please try again\n' + String(transaction))
                    }
                    console.log(transaction.tx)
                }).catch(err => {
                    console.log(error['message'])
                    error = String(error)
                    idx = error.indexOf('.')
                    js = JSON.parse(error.substring(idx + 1, error.length))
                    window.alert(js.message)
                    console.log(js)
                })
            }.bind(null, i))

            reject_btns[i].addEventListener("click", function (i) {
                reject_btns[i].parentNode.remove()
            }.bind(null, i))

            show_btns[i].addEventListener("click", function (i) {
                console.log(App.unauth_voters[1][i])
                det = $("#tb_body")
                det.empty()
                tr = $('<tr></tr>')
                td_1 = $('<td></td>')
                td_2 = td_1.clone()
                td_3 = td_1.clone()
                td_1.text(App.to_string(App.unauth_voters[1][i].name))
                td_2.text(App.unauth_voters[1][i].Aadhar)
                td_3.text(App.to_string(App.unauth_voters[1][i].area))
                tr.append(td_1, td_2, td_3)
                det.append(tr)
            }.bind(null, i))

        }
    }
    ,
    load_unauth_voters: async () => {
        $('#tb_det').hide()
        console.log(App.state)
        container = $('#register_tab')
        if (App.state === 1) {
            container.empty()
            await App.get_unauth_voters()
            for (i = 0; i < App.unauth_voters[1].length; i++) {
                if (!App.unauth_voters[1][i].is_authorized) {
                    adress = $("<h5></h5>")
                    div = $("<div></div>")
                    btn_det = $("<button></button>")
                    btn_ap = $("<button></button>")
                    btn_rej = $("<button></button>")
                    div.addClass("reg_vot mt-2 p-2 d-flex justify-content-between")
                    div.attr('id', i)
                    adress.addClass("voter_address text-wrap shadow")
                    adress.text(App.unauth_voters[0][i])
                    btn_det.addClass("btn btn-primary show_dt shadow")
                    btn_det.text("Show")
                    btn_ap.addClass("btn btn-success voter_approve_btn ml-2 shadow")
                    btn_ap.text("Approve")
                    btn_rej.addClass("btn btn-danger voter_reject ml-2 shadow")
                    btn_rej.text("Reject")
                    div.append(adress, btn_det, btn_ap, btn_rej)
                    container.append(div)
                }
            }
            await App.reg_ph_btn_evnt()
            $('#tb_det').show()

        }
        else if (App.state > 1) {
            container.empty()
            container.append('<h2 class = "text-center">Validation Phase is Over</h2>')
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
                th = $("<th></th>").text(1)
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
        App.state = await App.e_vot.check_state().catch(err => window.alert(err))
        App.state = App.state.toNumber()
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
    load_cities: async () => {
        area_list_1 = $('#Area_list_1')
        area_list_2 = $('#Area_list_2')
        area_list_3 = $('#Area_list_3')
        await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json').then(res => res.json()).then(data => { //4013
            // App.cities = []
            data.forEach(city => {
                if (city.state_id === 4013) {
                    opt = $('<option></option>')
                    opt.text(city.name)
                    opt.attr('value', city.name)
                    area_list_1.append(opt)
                    area_list_2.append(opt)
                    area_list_3.append(opt)
                }
            })
            console.log(App.cities)
        });
    },
    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)
        await App.load_state()
        await App.load_unauth_voters()
        console.log(App.state)
        await App.load_cities()
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
            await App.load_state()
            console.log(App.state)
            await App.load_unauth_voters()
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