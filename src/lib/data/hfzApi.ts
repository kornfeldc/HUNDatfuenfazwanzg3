import HfzMockApi from "$lib/data/hfzMockApi";
import {HfzSupabaseApi} from "$lib/data/hfzSupabaseApi";

export interface IHfzApi {
    getUser(): Promise<IUser>;
    
    getArticles(): Promise<Array<IArticle>>;
    getArticle(id: IId): Promise<IArticle>;
    createArticle(article: Partial<IArticle>): Promise<IArticle>;
    updateArticle(article: IArticle): Promise<IArticle>;

    getPersons(): Promise<Array<IPerson>>;
    getPerson(id: IId): Promise<IPerson>;
    getPersonCreditHistory(id: IId): Promise<Array<ICreditHistory>>;
    getPersonCourseHistory(id: IId): Promise<Array<ICourseHistory>>;
    getPersonSaleHistory(id: IId): Promise<Array<ISale>>;
    getPersonMergedHistory(id: IId): Promise<Array<IMergedPersonHistory>>;
    createPerson(person: Partial<IPerson>): Promise<IPerson>;
    updatePerson(person: IPerson): Promise<IPerson>;
    
    addPersonCredit(personId: IId, amount:number, date: Date): Promise<void>;
    addPersonCourse(personId: IId, amount:number, date: Date): Promise<void>;

    getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>>;
    getSale(id: IId): Promise<ISale>;
    getNewSaleForPerson(personId: IId): Promise<ISale>;

    getRobCourses(): Promise<Array<IRobCourse>>;
    getRobCourse(id: IId): Promise<IRobCourse>;
}

export class HfzApi {
    static create(): IHfzApi {
        return new HfzSupabaseApi();
    }
}

export interface IId {
    id: number;
}

export interface IUser extends IId {
   theme: "light" | "dark" | "system"; 
}

export interface ISale extends IId {
    additionalCredit: number;
    articleSum: number;
    extId: string;
    given: number;
    inclTip: number;
    payDate?: Date;
    person: IPerson;
    personName: string;
    saleDate: Date;
    toPay: number;
    toReturn: number;
    usedCredit: boolean;
    saleArticles: Array<ISaleArticle>;
}

export interface ISaleArticle extends IId {
    article: IArticle;
    amount: number;
    articlePrice: number;
    articleTitle: number;
    sale: ISale;
}

export interface ISaleDay {
    day: Date;
    payed: number;
    toPay: number;
}

export interface IPerson extends IId {
    courseCount: number;
    credit: number;
    dogNames: string;
    email: string;
    extId: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isMember: boolean;
    mainPerson?: IPerson;
    personGroup: string;
    phone: string;
    saleCount: number;
    saleCountActive: number;
    saleSum: number;
    info: string;
}

export interface IArticle extends IId {
    extId: string;
    isActive: boolean;
    isFavorite: boolean;
    price: number;
    title: string;
    type: ""; // todo - get types
}

export interface ICourseHistory extends IId {
    id: number;
    courses: number;
    date: Date;
    person: IPerson;
}

export interface ICreditHistory extends IId {
    credit: number;
    date: Date;
    person: IPerson;
    isBought: boolean;
    sale: ISale;
}

export interface IMergedPersonHistory {
    date: Date;
    creditBought: number; 
    creditUsed: number;
    coursesBought: number;
    coursesUsed: number;
    saleSum: number;
    creditHistory: Array<ICreditHistory>;
    courseHistory: Array<ICourseHistory>;
    saleHistory: Array<ISale>;
} 

export interface IPersonArticleUsage extends IId {
    article: IArticle;
    person: IPerson;
    amount: number;
}

export interface IRobCourse extends IId {
    date: Date;
    link: string;
    maxPersons: number;
    persons: Array<IRobCoursePerson>;
}

export interface IRobCoursePerson extends IId {
    course: IRobCourse;
    dogName: string;
    personName: string;
    timestamp: Date;
}

export const ArticleTypes = {
    "alcoholic": "Alkoholisch",
    "nonalcoholic": "Antialkoholisch",
    "snack": "Snacks",
    "sweet": "Süßes",
    "meal": "Mahlzeit",
    "other": "Sonstiges",
};