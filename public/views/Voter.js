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
        // await App.add_btn_event()
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
    load_result: async () => {
        console.log(App.state)
        if (App.state === 3) {
            winer = await App.e_vot.winnerNME_Vcount(App.area).catch(err => {
                console.log(error['message'])
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })
            console.log(winer)
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
    }
    ,
    get_state: async () => {
        state = await App.e_vot.check_state()
        App.state = state.toNumber()
        console.log(App.state)
    },
    fatct_data: async () => {
        await fetch('/data').then(res => res.json()).then(dt => {
            console.log(dt)
            App.email = dt.email
            App.aadhar = dt.aadhar
            App.area = dt.area
        }).catch(err => console.log(err))
    },
    load_state: async () => {
        lable_state = $('#phase')
        console.log(lable_state)
        console.log(App.state)
        lable_state.empty()
        switch (App.state) {
            case 0:
                lable_state.text("Registration on going")
                break
            case 1:
                lable_state.text("Validation on going")
                break
            case 2:
                lable_state.text("Voting on going")
                break
            case 3:
                lable_state.text("voting closed")
        }
    },
    load_prop: async () => {

        if (App.state == 2) {
            if (!App.area) {
                await App.fatct_data()
            }
            prop_array = await App.e_vot.getProposal(App.area).catch(error => {
                error = String(error)
                idx = error.indexOf('.')
                js = JSON.parse(error.substring(idx + 1, error.length))
                window.alert(js.message)
                console.log(js)
            })
            console.log(prop_array)
            // var i = 0;
            container = $('#voting_both')
            container.empty()
            for (var i = 0; i < prop_array.length; i++) {
                console.log(prop_array[i])
                card_div = $("<div></div>");
                card_div.addClass("card p-3 m-3 shadow-lg");
                card_div.css({ "width": "18rem" });
                img = $("<img></img>");
                img.addClass("card-img-top");
                img.attr("src", "");
                div_card_body = $("<div></div>");
                div_card_body.addClass("card-body");
                h_tag = $("<h5></h5>");
                h_tag.addClass("card-title");
                h_tag.text(App.to_string(prop_array[i].name));
                sub_title = $("<h6></h6>");
                sub_title.addClass("card-subtitle mb-2 text-muted");
                sub_title.text("Party : " + App.to_string(prop_array[i].party));
                btn = $("<button></button>");
                btn.addClass("btn btn-primary card_btn");
                btn.attr("type", "button");
                btn.text("PRESS TO VOTE ME");
                // btn.bind("click", (i) => {
                //     console.log("HHi" + i)
                // })
                console.log(h_tag, sub_title, btn)
                div_card_body.append(h_tag, sub_title, btn);
                console.log(div_card_body)
                card_div.append(img, div_card_body);
                console.log(card_div)
                container.append(card_div);
                // console.log(i)
            }
            App.add_btn_event()
        }
        else if (App.state > 2) {
            h = $("#voting_ph")
            h.empty()
            h.text("Voting phase is over")
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
        // Add events Tasks
        await App.get_state()
        await App.load_state()
        await App.fatct_data()
        await App.load_prop()
        // Update loading state
        await App.load_result()
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
    add_btn_event: () => {
        const nodes = document.getElementsByClassName('card_btn');
        console.log(nodes, nodes.length)

        for (var i = 0; i < nodes.length; i++) {
            console.log(nodes[i])
            nodes[i].addEventListener('click', async function (i) {
                if (!(App.email && App.aadhar)) {
                    await App.fatct_data()
                }
                try {
                    await App.e_vot.vote(App.email, App.aadhar, i, { 'from': ethereum.selectedAddress }).then(
                        (transaction) => {
                            if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                                window.alert('Your vote has been casted')
                                emailjs.send(serviceID, templateID, { from_name: "E-voting", g_mail: App.email, message: "Your vote has been casted.Thanks for your vote", to_mail: App.email })
                                    .then(() => {
                                        console.log('Sent!');
                                    }, (err) => {
                                        console.log(JSON.stringify(err));
                                    });
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
                }
                catch (error) {
                    window.alert(error);
                    console.log(error);
                }
            }.bind(null, i));
            console.log(nodes[i])
        }
        console.log("Event are added successfully")
    }
}

$(() => {
    $(window).on('load', App.load);
    // App.add_btn_event()
})
// var email = <%-eml%>
//     console.log(email)

