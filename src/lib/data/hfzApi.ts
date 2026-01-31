import HfzMockApi from "$lib/data/hfzMockApi";
import {HfzSupabaseApi} from "$lib/data/hfzSupabaseApi";
import type {SupabaseClient} from "@supabase/supabase-js";

export interface IHfzApi {
    getUser(): Promise<IUser>;
    updateUserTheme(email: string, theme: string): Promise<void>;
    getTheme(): Promise<"light" | "dark" | "system">;
    
    getArticles(): Promise<Array<IArticle>>;
    getArticle(id: IId): Promise<IArticle>;
    createArticle(article: Partial<IArticle>): Promise<IArticle>;
    updateArticle(article: IArticle): Promise<IArticle>;
    deleteArticle(id: IId): Promise<void>;

    getPersons(): Promise<Array<IPerson>>;
    getPersonsWithCourseHistory(days: number): Promise<Array<IPersonWithHistory>>;
    getPerson(id: IId): Promise<IPerson>;
    getPersonCreditHistory(id: IId): Promise<Array<ICreditHistory>>;
    getPersonCourseHistory(id: IId): Promise<Array<ICourseHistory>>;
    getPersonSaleHistory(id: IId): Promise<Array<ISale>>;
    getPersonMergedHistory(id: IId): Promise<Array<IMergedPersonHistory>>;
    createPerson(person: Partial<IPerson>): Promise<IPerson>;
    updatePerson(person: IPerson): Promise<IPerson>;
    deletePerson(id: IId): Promise<void>;
    
    addPersonCredit(personId: IId, amount:number, date: Date, saleId?: IId): Promise<void>;
    addPersonCourse(personId: IId, amount:number, date: Date): Promise<void>;

    getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>>;
    getSale(id: IId): Promise<ISale>;
    saveSale(sale: ISale): Promise<ISale>;
    paySale(sale: ISale): Promise<ISale>;
    paySalesWithCredit(date?: string, saleId?: number): Promise<void>;
    deleteSale(id: IId): Promise<void>;
    getNewSaleForPerson(personId?: IId): Promise<ISale>;
    
    getTopSoldArticles(personId?: IId, dateFrom?: Date): Promise<Array<ISoldArticleAggregate>>;
    getTopSoldArticlesBySaleId(saleId?: IId, dateFrom?: Date): Promise<Array<ISoldArticleAggregate>>;
    getTopPersonsBySales(dateFrom?: Date): Promise<Array<IPersonSaleAggregate>>;

    getStatisticsArticles(year?: string): Promise<Array<{label: string, value: number}>>;
    getStatisticsSales(year?: string): Promise<Array<{label: string, count: number, volume: number}>>;
    getStatisticsPersonSales(year?: string): Promise<Array<{label: string, value: number}>>;
    getAvailableYears(): Promise<Array<string>>;

    getRobCourses(): Promise<Array<IRobCourse>>;
    getRobCourse(id: IId): Promise<IRobCourse>;
    getRobCourseByLink(link: string): Promise<IRobCourse>;
    createRobCourse(robCourse: Partial<IRobCourse>): Promise<IRobCourse>;
    updateRobCourse(robCourse: IRobCourse): Promise<IRobCourse>;
    deleteRobCourse(id: IId): Promise<void>;
    addRobCoursePerson(robCourseId: number, personName: string, dogName: string): Promise<void>;
    deleteRobCoursePerson(id: number): Promise<void>;
    
    getUnassignedUsers(): Promise<Array<IUser>>;
    assignUserToOg(email: string, og: number): Promise<void>;

    getHistory(entityType?: string, entityId?: string | number): Promise<Array<IHistory>>;
}

export class HfzApi {
    static create(supabase: SupabaseClient, og: number): IHfzApi {
        return new HfzSupabaseApi(supabase, og);
    }
}

export interface IId {
    id: number;
}

export interface IUser  {
   theme: "light" | "dark" | "system"; 
   email?: string;
   name?: string;
   avatarUrl?: string;
   lastLogin?: Date;
   admin?: boolean;
   og?: number;
}

export interface ISale extends IId {
    addAdditionalCredit: number;
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
    articleTitle: string;
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
    mainPersonId?: number;
    personGroup: string;
    phone: string;
    saleCount: number;
    saleCountActive: number;
    saleSum: number;
    info: string;
}

export interface IPersonWithHistory extends IPerson {
    courseHistory: Array<ICourseHistory>;
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

export interface ISoldArticleAggregate {
    articleId: number;
    count: number;
}

export interface IPersonSaleAggregate {
    personId: number;
    count: number;
}

export interface IHistory extends IId {
    timestamp: Date;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    og: number;
}