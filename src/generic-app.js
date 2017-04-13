const opath = require('object-path')

function defaultRenderFn({ key, val, oldval }) {
    console.info(`viewmodel updated:`, { key, val, oldval })
}

class GenericApp {
    constructor({
        basemodel = {},
        viewmodel = DefaultViewModel,
        dataloader = new DefaultDataLoader(),
        renderfn = defaultRenderFn
    } = {}){
        this.vm = new viewmodel({ basemodel, notifyfn: renderfn })
        this.loader = dataloader
        this._renderfn = renderfn
    }
}

class DefaultViewModel {
    constructor({ basemodel = {}, notifyfn } = {}){
        this._viewmodel = basemodel
        this._notifyfn = notifyfn
    }
    get(key){
        return opath.get(this._viewmodel, key)
    }
    set(key, val){
        // save original value
        const oldval = this.get(key)

        // set property
        opath.set(this._viewmodel, key, val)

        // notify listener
        if (this._notifyfn) {
            this._notifyfn({ key, val, oldval, vm: this._viewmodel })
        }

        return this._viewmodel
    }
}

class DefaultDataLoader {
    constructor({ loader = window.fetch.bind(window), logger = console } = {}){
        this._loader = loader
        this._logger = logger
    }
    log() {
        this._logger.info.apply(null, arguments)
    }
    get(url, opts = {}) {
        this.log('GET', { url, opts })
        const params = Object.assign({}, opts, {
            method: 'GET'
        })
        return this._loader(url, params)
    }
    post(url, opts = {}) {
        this.log('POST', { url, opts })
        const params = Object.assign({}, opts, {
            method: 'POST'
        })
        return this._loader(url, params)
    }
    delete(url) {
        this.log('DELETE', { url, opts })
        const params = Object.assign({}, opts, {
            method: 'DELETE'
        })
        return this._loader(url, params)
    }
    put(url, opts) {
        this.log('PUT', { url, opts })
        const params = Object.assign({}, opts, {
            method: 'PUT'
        })
        return this._loader(url, params)
    }
}

module.exports = { GenericApp, DefaultViewModel, DefaultDataLoader }
