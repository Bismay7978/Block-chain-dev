
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
    // }
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
    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const e_vot = await $.getJSON('./json/E_voting_system.json')
        App.contracts.E_vot = TruffleContract(e_vot);
        App.contracts.E_vot.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.e_vot = await App.contracts.E_vot.deployed()

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
    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Add events Tasks
        await App.load_cities()
        // Update loading state
        App.setLoading(false)
    },
    load_cities: async () => {
        area_list = $('#Area_list_2')
        await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json').then(res => res.json()).then(data => { //4013
            // App.cities = []
            data.forEach(city => {
                if (city.state_id === 4013) {
                    opt = $('<option></option>')
                    opt.text(city.name)
                    opt.attr('value', city.name)
                    area_list.append(opt)
                }
            })
            console.log(App.cities)
        });
    },
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
    reg: async () => {
        pass1 = $('#Pass1').val()
        pass2 = $('#Pass2').val()
        fname = $('#fname').val()
        lname = $('#lname').val()
        full_name = fname + ' ' + lname
        email = $('#Email').val()
        aadhar = $('#Aadhar').val()
        area = $('#Area_list_2').val()
        if (!(fname && lname && email && aadhar && area && pass1 && pass2)) {
            window.alert("Find some empty value please fill it properly")
        }
        else if (pass1 != pass2) {
            window.alert("Password not same")
        }
        else {
            console.log(full_name, email, pass1, aadhar, area)
            await App.e_vot.voter_reg(email, pass1, full_name, aadhar, area, { 'from': ethereum.selectedAddress }).then(transaction => {
                if (transaction.tx != undefined || transaction.tx != "" || transaction.tx != null) {
                    window.alert('You have successfully registered')
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
            // console.log("Hi")
        }
    }
}

$(() => {
    $(window).on('load', App.load);
})

const reg_btn = document.getElementById('reg_btn')
console.log(reg_btn)
reg_btn.addEventListener('click', App.reg)