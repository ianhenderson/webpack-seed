// External deps
const React = require('react');
const ReactDOM = require('react-dom');

const h = require('react-hyperscript');
const { br, table, thead, tbody, th, td, tr, div, span, h1, h4, p, input, button, form } = require('hyperscript-helpers')(h);
const el = React.createElement;

// Internal deps
const { GenericApp } = require('./generic-app')

// Declarations
let ROOT

class TestApp extends GenericApp {
    constructor({ basemodel, viewmodel, dataloader, notifyfn } = {}){
        super({ basemodel, viewmodel, dataloader, notifyfn })
        this._apiPrefix = 'https://statsapi.mlb.com/api/v1'
        this.getGumbo = this.getGumbo.bind(this)
        this._collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
    }

    getGumbo(){
        const gamepk = this.vm.get('gamepk')
        const url = `${this._apiPrefix}/game/${gamepk}/feed/live`
        this.loader.get(url)
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
        gamepk: 487614,
        inputValue: '',
        plays: []
    },
    // viewmodel: 'proxy', // use ES6 Proxy-based viewmodel
    notifyfn: render
})

/*
    Components
 */

function onSearchFormInput(e){
    app.vm.set('inputValue', e.target.value)
}

function onSearchFormSubmit(e){
    e.preventDefault()
    app.getGumbo()
}

function App(args) {
    return div( [
        SearchForm(args),
        GumboTable(args)
    ])
}

function SearchForm(args) {
    return form( {onSubmit: onSearchFormSubmit}, [
        input('.main', {onInput: onSearchFormInput}),
        button('.btn', 'Get guids')
    ])
}

function onGumboTableHeaderClick(e) {
    const { innerText } = e.target
    const sortkey = app.vm.get('sortkey')
    if ( innerText === sortkey ) {
        app.vm.set('sortreverse', true)
    } else {
        app.vm.set('sortreverse', false)
        app.vm.set('sortkey', innerText)
    }
}
function GumboTable(){
    const plays = app.vm.get('plays')
    let theaders = []
    let tdata = []
    if (plays.length) {
        let headers = Object.keys( plays[0].result )
        theaders = headers.map(h => th(h))
        tdata = plays
        .filter(p => p.result.description.toLowerCase().includes( app.vm.get('inputValue') ))
        .sort((a,b) => {
            const sortkey = app.vm.get('sortkey')
            const sortreverse = app.vm.get('sortreverse')
            let comp

            if ( !sortkey ) {
                comp = 1
            } else {
                comp = app._collator.compare( a.result[sortkey], b.result[sortkey] )
            }

            if ( sortreverse ) {
                comp *= -1
            }


            return comp
        })
        .map(p => {
            let r = p.result
            let tds = headers.map( h => td(r[h]) )
            return tr(tds)
        })

    }
    return table('.table', [
        thead( {onClick: onGumboTableHeaderClick}, [
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
