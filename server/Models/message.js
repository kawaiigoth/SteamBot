class Message {
    constructor(text, geo, date, photo, status) {
            this.message = text;
            this.geotag = geo;
            this.photo = photo;
            this.datetime = date || new Date().toISOString();
            this.status = status || 'unreaded';
    }

}

module.exports = Message;