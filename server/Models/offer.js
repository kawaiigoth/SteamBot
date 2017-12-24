class Offer {
    constructor(id,owner_id,link, owner_name, cost, currency, keys, type) {
        this.id = id;
        this.owner_id = owner_id;
        this.user_link = link;
        this.owner_name = owner_name;
        this.cost = cost;
        this.currency = currency;
        this.keys = keys;
        this.offer_type = type || undefined;
    }

}

module.exports = Offer;