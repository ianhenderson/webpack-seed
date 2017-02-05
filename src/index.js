const React = require('react');
const ReactDOM = require('react-dom');

const h = require('react-hyperscript');
const { br, table, thead, tbody, th, td, tr, div, span, h1, h4, p, input, button } = require('hyperscript-helpers')(h);
const el = React.createElement;
let ROOT;

let viewModel = new Proxy({
    inputValue: '',
    plays: []
}, {
    set(target, key, newVal){
        target[key] = newVal;
        render();
        console.log('viewModel update');
    }
});

const API = {
    _gumboURI: 'https://statsapi.mlb.com/api/v1/game/487614/feed/live',
    getGuids(){
        console.log('Fetching gumbo...')
        fetch(API._gumboURI)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log('Fetching gumbo...complete!')
                viewModel.plays = data.liveData.plays.allPlays
            })
            .catch(err => {
                console.log(err)
            })
    }
}



/*
    Components
 */

function onInput(e){
    viewModel.inputValue = e.target.value;
}

function App() {
     return div( [
        input('.main', {onInput}),
        button('.btn', {onClick: API.getGuids}, 'Get guids'),
        // Table(),
        GumboTable(),
     ]);
}

function GumboTable(){
    let plays = viewModel.plays
    let theaders = []
    let tdata = []
    if (plays.length) {
        let headers = Object.keys( plays[0].result )
        theaders = headers.map(h => th(h))
        tdata = plays
        .filter(p => p.result.description.toLowerCase().includes(viewModel.inputValue))
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
    return viewModel.inputValue.split('').map(i =>  Row(i) )
}

function Row() {
    return div(
        viewModel.inputValue.split('').map(i =>  span(i) )
    )
}

/*
    Public methods
 */

function render(rootEl){
    ROOT = rootEl || ROOT;
    ReactDOM.render(
        App(),
        ROOT
    );
}

module.exports = { render }
