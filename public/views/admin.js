const serviceID = 'default_service';
const templateID = 'template_6kfri9k';
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
        for (var i = 0, j = 0; i < approve_btns.length; i++) {
            approve_btns[i].addEventListener("click", async function (i) {
                console.log(App.to_string(App.unauth_voters[0][i]), i)
                await App.e_vot.giveRightToVote(App.unauth_voters[0][i], { 'from': ethereum.selectedAddress }).then(transaction => {
                    if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                        window.alert('Rights for votering have been given to ' + App.to_string(App.unauth_voters[0][i]) + " Account")
                        emailjs.send(serviceID, templateID, { from_name: "E-voting", g_mail: App.to_string(App.unauth_voters[0][i]), message: "You are authorised to vote", to_mail: App.to_string(App.unauth_voters[0][i]) })
                            .then(() => {
                                console.log('Sent!');
                            }, (err) => {
                                console.log(JSON.stringify(err));
                            });
                        approve_btns[i].parentNode.remove()
                    }
                    else {
                        window.alert('Getting some Error please try again\n' + String(transaction))
                    }
                    console.log(transaction.tx)
                }).catch(err => {
                    console.log(err['message'])
                    error = String(err)
                    idx = error.indexOf('.')
                    js = JSON.parse(error.substring(idx + 1, error.length))
                    window.alert(js.message)
                    console.log(js)
                })
            }.bind(null, i))

            reject_btns[i].addEventListener("click", function (i) {
                emailjs.send(serviceID, templateID, { from_name: "E-voting", g_mail: App.to_string(App.unauth_voters[0][i]), message: "You are rejected to give vote", to_mail: App.to_string(App.unauth_voters[0][i]) })
                    .then(() => {
                        console.log('Sent!');
                    }, (err) => {
                        console.log(JSON.stringify(err));
                    });
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
            email = []
            voters = []
            for (i = 0; i < App.unauth_voters[1].length; i++) {
                if (!App.unauth_voters[1][i].is_authorized) {
                    email.push(App.unauth_voters[0][i])
                    voters.push(App.unauth_voters[1][i])
                    adress = $("<h5></h5>")
                    div = $("<div></div>")
                    btn_det = $("<button></button>")
                    btn_ap = $("<button></button>")
                    btn_rej = $("<button></button>")
                    div.addClass("reg_vot mt-2 p-2 d-flex justify-content-between")
                    div.attr('id', i)
                    adress.addClass("voter_address text-wrap shadow")
                    adress.text(App.to_string(App.unauth_voters[0][i]))
                    btn_det.addClass("btn btn-primary show_dt shadow")
                    btn_det.text("Show")
                    btn_ap.addClass("btn btn-success voter_approve_btn ml-2 shadow")
                    btn_ap.text("Approve")
                    btn_rej.addClass("btn btn-danger voter_reject ml-2 shadow")
                    btn_rej.text("Reject")
                    div.append(adress, btn_det, btn_ap, btn_rej)
                    btn_det.bind('click',)
                    container.append(div)
                }
            }
            App.emails = App.unauth_voters[0]
            App.unauth_voters[0] = email
            App.unauth_voters[1] = voters
            await App.reg_ph_btn_evnt()
            $('#tb_det').show()

        }
        else if (App.state > 1) {
            container.empty()
            container.append('<h2 class = "text-center status">Validation Phase is Over</h2>')
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
        var headers = new Headers();
        headers.append("X-CSCAPI-KEY", "UUxRbU92YUJudEh5SEZEWERvZXpMT2xXMjN2YklpNjgzaDBMNHFkdA==");

        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };
        area_list_1 = $('#Area_list_1')
        area_list_2 = $('#Area_list_2')
        area_list_3 = $('#Area_list_3')
        area_list_4 = $('#Area_list_4')

        await fetch("https://api.countrystatecity.in/v1/countries/IN/states/OR/cities", requestOptions).then(res => res.json()).then(data => { //4013
            // App.cities = []
            data.forEach(city => {
                opt1 = $('<option></option>')
                opt1.text(city.name)
                opt1.attr('value', city.name)
                opt2 = opt1.clone()
                opt3 = opt1.clone()
                opt4 = opt1.clone()
                area_list_1.append(opt1)
                area_list_2.append(opt2)
                area_list_3.append(opt3)
                area_list_4.append(opt4)
            })
            // console.log(App.cities)
        }).catch(e => console.log(e));

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
        // Add events Tasks
        await App.load_cities()
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
    load_total_voters: async () => {
        opt = $('#Area_list_4').val()
        t_body = $('#voter_count')
        t_body.empty()
        if (opt) {
            voter_count = await App.e_vot.voter_count(opt).catch(error => {
                console.log(JSON.stringify(error))
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })

            vote_count = await App.e_vot.vote_count(opt).catch(error => {
                console.log(JSON.stringify(error))
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })
            tr = $('<tr></tr>')
            td1 = $('<td></td>')
            td2 = td1.clone()
            td1.text(voter_count)
            td2.text(vote_count)
            tr.append(td1, td2)
            t_body.append(tr)
            console.log(vote_count, voter_count)
        }
    }
    ,
    change_state: async () => {
        try {
            if (!App.emails) {
                App.emails = await App.e_vot.get_emails().catch(e => console.log(e))
            }
            console.log(App.emails)
            test = await App.e_vot.changeState({ 'from': ethereum.selectedAddress }).then(async (transaction) => {
                if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                    window.alert('Phase change successfully')
                    await App.render()
                    var state = ""
                    if (App.state === 1) {
                        state = "validation"
                    }
                    else if (App.state === 2) {
                        state = "voting"
                    }
                    else if (App.state === 3) {
                        state = "cloesd & result declared"
                    }
                    for (var i = 0; i < App.emails.length; i++) {
                        emailjs.send(serviceID, templateID, { from_name: "E-voting", g_mail: App.to_string(App.emails[i]), message: state + " going on", to_mail: App.to_string(App.emails[i]) })
                            .then(() => {
                                console.log('Sent!');
                            }, (err) => {
                                console.log(JSON.stringify(err));
                            });
                    }
                }
                else {
                    window.alert('Getting some Error please try again\n' + String(transaction))
                }
                console.log(transaction.tx)
            }).catch((error) => {
                console.log(error['message'])
                console.log(JSON.stringify(error))
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })
            console.log(test)
            console.log(App.state)
        }
        catch (error) {
            console.log(error['message'])
            window.alert(error['message'])
        }
    }
}

$(() => {
    // var slowload = window.setTimeout(()=>{
    //     alert("connection is poor please check your network")
    // },100)
    if (!navigator.onLine) {
        window.alert("You are Offline please check your connection")
        App.setLoading(true)
    }
    else {
        $(window).on('load', async () => {
            // window.clearTimeout(slowload)
            await App.load()
        });
    }
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

area_lst = document.getElementById("Area_list_4")
area_lst.addEventListener('change', App.load_total_voters)