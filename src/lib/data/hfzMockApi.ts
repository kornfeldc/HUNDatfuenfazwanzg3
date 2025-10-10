import type { IArticle, IHfzApi, IId, IPerson, ISale } from "$lib/data/hfzApi";

// In-memory mock data for development/testing only.
// Generates ~10 persons, 10 articles, and 50 sales with dates from now and the last month.

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRecentDate(): Date {
    // Random date within the last 30 days, sometimes exactly now
    const now = new Date();
    const chanceNow = Math.random() < 0.2; // 20% current date/time
    if (chanceNow) return now;
    const daysAgo = randomInt(1, 30);
    const hours = randomInt(0, 23);
    const minutes = randomInt(0, 59);
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

// Create persons
const persons: IPerson[] = Array.from({ length: 10 }).map((_, idx) => {
    const id = idx + 1;
    const firstNames = [
        "Alex", "Jamie", "Taylor", "Jordan", "Casey",
        "Morgan", "Riley", "Cameron", "Drew", "Quinn"
    ];
    const lastNames = [
        "Smith", "Johnson", "Brown", "Williams", "Jones",
        "Miller", "Davis", "Garcia", "Rodriguez", "Martinez"
    ];
    const firstName = firstNames[idx % firstNames.length];
    const lastName = lastNames[idx % lastNames.length];
    const full = `${firstName}.${lastName}`.toLowerCase();
    const credit = randomInt(0, 200);
    const saleCount = randomInt(0, 20);
    const saleSum = saleCount * randomInt(10, 50);
    const isMember = Math.random() < 0.6;
    const isActive = Math.random() < 0.85;

    const base: IPerson = {
        id,
        courseCount: randomInt(0, 12),
        credit,
        dogNames: ["Buddy", "Luna", "Charlie", "Milo", "Bella"][idx % 5],
        email: `${full}@example.com`,
        extId: `P-${1000 + id}`,
        firstName,
        lastName,
        isActive,
        isMember,
        // For mainPerson, reference self for simplicity in mock
        mainPerson: undefined as unknown as IPerson, // temporary, will assign after
        personGroup: isMember ? "Member" : "Guest",
        phone: `+1-555-01${(10 + id).toString().padStart(2, "0")}`,
        saleCount,
        saleCountActive: Math.max(0, saleCount - randomInt(0, 5)),
        saleSum
    };
    return base;
});
// fix mainPerson self-references
persons.forEach(p => (p.mainPerson = p));

// Create articles
const articles: IArticle[] = Array.from({ length: 10 }).map((_, idx) => {
    const id = idx + 1;
    const titles = [
        "Single Course", "5-Course Pack", "10-Course Pack", "Annual Membership",
        "Monthly Membership", "Dog Toy", "Leash", "Treat Pack",
        "Private Session", "Workshop Ticket"
    ];
    const priceBase = [15, 65, 120, 300, 35, 12, 20, 8, 60, 40][idx] || randomInt(5, 100);
    return {
        id,
        extId: `A-${2000 + id}`,
        isActive: Math.random() < 0.9,
        isFavorite: Math.random() < 0.3,
        price: priceBase,
        title: titles[idx] || `Article ${id}`,
        type: ""
    } as IArticle;
});

// Create sales (50) using persons and articles
const sales: ISale[] = [];
for (let idx = 0; idx < 50; idx++) {
    const id = idx + 1;
    const person = persons[idx % persons.length];
    const saleDate = randomRecentDate();

    // choose 1-3 articles and amounts
    const articleCount = randomInt(1, 3);
    const chosenArticles = Array.from({ length: articleCount }).map((_, i) => articles[(idx + i) % articles.length]);

    // We'll first create a partial sale to reference from saleArticles, then finalize it
    const partialSale: ISale = {
        id,
        additionalCredit: 0, // temporary, will set later
        articleSum: 0,       // temporary, will set later
        extId: `S-${3000 + id}`,
        given: 0,            // temporary, will set later
        inclTip: 0,          // temporary, will set later
        payDate: new Date(saleDate.getTime()),
        person,
        personName: `${person.firstName} ${person.lastName}`,
        saleDate,
        toPay: 0,            // temporary, will set later
        toReturn: 0,         // temporary, will set later
        usedCredit: false,   // temporary, will set later
        saleArticles: []
    } as ISale;

    // Build saleArticles with amounts and prices
    const saleArticles = chosenArticles.map((a, i) => {
        const amount = 1 + (Math.random() < 0.3 ? randomInt(1, 2) : 0); // mostly 1, sometimes 2-3
        const articlePrice = a.price;
        return {
            id: i + 1,
            article: a,
            amount,
            articlePrice,
            // Interface defines articleTitle as number; use article id to satisfy type
            articleTitle: a.title,
            sale: partialSale
        };
    });

    // Calculate sums based on saleArticles
    const articleSum = saleArticles.reduce((sum, sa) => sum + sa.articlePrice * sa.amount, 0);

    const usedCredit = Math.random() < 0.4 && person.credit > 0;
    const creditUsedAmount = usedCredit ? Math.min(person.credit, randomInt(0, Math.floor(articleSum / 2))) : 0;
    const toPay = Math.max(0, articleSum - creditUsedAmount);
    const tip = Math.random() < 0.3 ? randomInt(1, 10) : 0;
    const inclTip = toPay + tip;
    const given = inclTip + (Math.random() < 0.2 ? randomInt(0, 5) : 0);
    const toReturn = Math.max(0, given - inclTip);

    // sometimes pay later the same day or next day
    const payDate = new Date(saleDate.getTime());
    payDate.setHours(payDate.getHours() + randomInt(0, 36));

    // finalize sale
    partialSale.additionalCredit = Math.random() < 0.1 ? randomInt(5, 50) : 0;
    partialSale.articleSum = articleSum;
    partialSale.given = given;
    partialSale.inclTip = inclTip;
    partialSale.payDate = payDate;
    partialSale.toPay = toPay;
    partialSale.toReturn = toReturn;
    partialSale.usedCredit = usedCredit;
    partialSale.saleArticles = saleArticles as any;

    sales.push(partialSale);
}

export class HfzMockApi implements IHfzApi {
    async getArticles(): Promise<Array<IArticle>> {
        return articles;
    }

    async getArticle(id: IId): Promise<ISale> {
        // Interface dictates ISale return. Return a sale by id to satisfy contract.
        const found = sales.find(s => s.id === id.id) || sales[0];
        return found;
    }

    async getPersons(): Promise<Array<IPerson>> {
        return persons;
    }

    async getPerson(id: IId): Promise<ISale> {
        // Interface dictates ISale return. Return a sale by id to satisfy contract.
        const found = sales.find(s => s.id === id.id) || sales[0];
        return found;
    }

    async getSale(id: IId): Promise<ISale> {
        const found = sales.find(s => s.id === id.id);
        if (!found) throw new Error(`Sale with id ${id.id} not found`);
        return found;
    }

    async getSales(): Promise<Array<ISale>> {
        return sales;
    }
}