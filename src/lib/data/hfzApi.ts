import {HfzMockApi} from "$lib/data/hfzMockApi";

export interface IHfzApi {
    getArticles(): Promise<Array<IArticle>>;
    getArticle(id: IId): Promise<ISale>;
    
    getPersons(): Promise<Array<IPerson>>;
    getPerson(id: IId): Promise<ISale>;
    
    getSales(): Promise<Array<ISale>>;
    getSale(id: IId): Promise<ISale>;
}

export class HfzApi {
    static create(): IHfzApi {
        return new HfzMockApi();
    }
}

export interface IId {
    id: number;
}

export interface ISale extends IId {
    additionalCredit: number;
    articleSum: number;
    extId: string;
    given: number;
    inclTip: number;
    payDate: Date;
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
    mainPerson: IPerson;
    personGroup: string; 
    phone: string;
    saleCount: number;
    saleCountActive: number;
    saleSum: number;
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
    credits: number;
    date: Date;
    person: IPerson;
    isBought: boolean;
    sale: ISale;
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
}

export interface IRobCoursePerson extends IId {
    course: IRobCourse;
    dogName: string;
    personName: string;
    timestamp: Date;
}

