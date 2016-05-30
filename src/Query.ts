import Message from './Message';
import Result from './Result';


class Query extends Message {
    public results: Result[];

    constructor() {
        super();

        this.results = [];
    }

    peekBack(): Result {
        return this.results[this.results.length - 1];
    }

    resolve() {
        super.resolve(this.results);
    }
}


export default Query;
