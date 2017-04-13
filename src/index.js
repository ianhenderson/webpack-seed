// External deps
const React = require('react');
const ReactDOM = require('react-dom');

const h = require('react-hyperscript');
const { br, table, thead, tbody, th, td, tr, div, span, h1, h4, p, input, button } = require('hyperscript-helpers')(h);
const el = React.createElement;

// Internal deps
const { GenericApp } = require('./generic-app')

// Declarations
let ROOT

class TestApp extends GenericApp {
    constructor({ basemodel, viewmodel, dataloader, notifyfn } = {}){
        super({ basemodel, viewmodel, dataloader, notifyfn })
        this._gumboURI = 'https://statsapi.mlb.com/api/v1/game/487614/feed/live'
        this.getGuids = this.getGuids.bind(this)
    }

    getGuids(){
        this.loader.get(this._gumboURI)
            .then(res => {
                return res.json()
            })
            .then(resjson => {
                console.log('Fetching gumbo...complete!')
                this.vm.set('plays', resjson.liveData.plays.allPlays )
            })
            .catch(err => {})
    }

}

const app = new TestApp({
    basemodel: {
        inputValue: '',
        plays: []
    },
    // viewmodel: 'proxy', // use ES6 Proxy-based viewmodel
    notifyfn: render
})

/*
    Components
 */

function onInput(e){
    app.vm.set('inputValue', e.target.value)
}

function App(args) {
     return div( [
        input('.main', {onInput}),
        button('.btn', {onClick: app.getGuids}, 'Get guids'),
        // Table(),
        GumboTable(),
     ]);
}

function GumboTable(){
    let plays = app.vm.get('plays')
    let theaders = []
    let tdata = []
    if (plays.length) {
        let headers = Object.keys( plays[0].result )
        theaders = headers.map(h => th(h))
        tdata = plays
        .filter(p => p.result.description.toLowerCase().includes( app.vm.get('inputValue') ))
        .map(p => {
            let r = p.result
            let tds = headers.map( h => td(r[h]) )
            return tr(tds)
        })

    }
    return table('.table', [
        thead([
            tr(theaders)
        ]),
        tbody(tdata)
    ])
}

function Table() {
    return app.vm.get('inputValue').split('').map(i =>  Row(i) )
}

function Row() {
    return div(
        app.vm.get('inputValue').split('').map(i =>  span(i) )
    )
}

/*
    Public methods
 */

function render(args){
    const { rootEl } = args
    ROOT = rootEl || ROOT;
    ReactDOM.render(
        App(args),
        ROOT
    );
}

module.exports = { render, app }
