/**
 * @module collections/modules/Tags
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import Module from './Module';
import Collection from '../Tags';

/**
 * Tag collection module
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Tags extends Module {

    /**
     * Tag collection.
     *
     * @see module:collections/Tags
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        // Add new replies
        this.channel.reply({
            addTags: this.addTags,
        }, this);
    }

    /**
     * Add several tags.
     *
     * @param {Object} options
     * @param {String} options.profileId
     * @param {Array} options.tags
     * @returns {Promise}
     */
    addTags(options) {
        const promise = Promise.resolve();

        _.each(options.tags || [], name => {
            promise.then(() => this.addTag(_.extend({name}, options)));
        });

        return promise;
    }

    /**
     * Add a new tag if it does not exist.
     *
     * @param {Object} options
     * @param {String} options.name - name of the tag
     * @param {String} options.profileId
     * @returns {Promise}
     */
    async addTag(options) {
        const opt   = options;
        const id    = await this.getId({data: opt});
        const model = new this.Model({id});

        model.setEscape(opt);
        return super.saveModel({model});
    }

    /**
     * Save a tag model.
     *
     * @param {Object} options
     * @param {Object} options.model
     * @returns {Promise}
     */
    async saveModel(options) { // eslint-disable-line complexity
        const {model, data} = options;

        // If the tag is about to be removed, don't generate a new ID
        if (data && Number(data.trash) === 2) {
            return super.saveModel(options);
        }

        const id = await this.getId(options);

        // If it is not a new model and its ID has changed, remove it
        if (model.id && model.id !== id) {
            await this.remove({model});
        }

        model.set({id});
        return super.saveModel(options);
    }

    /**
     * Every tag has a unique ID generated by using sha256 function on their names.
     *
     * @param {Object} options
     * @param {Object} [options.data]
     * @param {Object} [options.model]
     * @returns {Promise}
     */
    async getId(options) {
        const name = (options.data || {}).name || options.model.get('name');
        const sha  = await Radio.request('models/Encryption', 'sha256', {text: name});

        return sha.join('');
    }

}
