import type {
    IArticle,
    ICourseHistory,
    ICreditHistory,
    IHfzApi,
    IId,
    IMergedPersonHistory,
    IPerson,
    IRobCourse,
    ISale,
    IUser
} from "$lib/data/hfzApi";
import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import moment from "moment";

export class HfzSupabaseApi implements IHfzApi {

    supabase: SupabaseClient;
    og: number;

    constructor(supabase: SupabaseClient, og: number) {
        this.supabase = supabase;
        this.og = og;
    }

    async addPersonCredit(personId: IId, amount: number, date: Date): Promise<void> {
        const supabase = this.supabase;
        const payload: any = {
            personId: personId.id,
            credit: amount,
            date: date,
            isBought: amount > 0,
        };
        const { error } = await supabase
            .from('credit_history')
            .insert(payload);
        if (error) throw error;

        // update person
        const person = await this.getPerson(personId);
        const newCredit = (person.credit ?? 0) + amount;
        const {_, persError} = await supabase
            .from('person')
            .update({credit: newCredit})
            .eq('og', this.og)
            .eq('id', personId.id)
            .select('*')
            .single();

        if (persError) throw persError;
    }

    async addPersonCourse(personId: IId, amount: number, date: Date): Promise<void> {
        const supabase = this.supabase;
        const payload: any = {
            personId: personId.id,
            courses: amount,
            date: date
        };
        const { error } = await supabase
            .from('course_history')
            .insert(payload);
        if (error) throw error;
        
        // update person
        const person = await this.getPerson(personId);
        const newCourseCount = (person.courseCount ?? 0) + amount;
        const {_, persError} = await supabase
            .from('person')
            .update({courseCount: newCourseCount})
            .eq('og', this.og)
            .eq('id', personId.id)
            .select('*')
            .single();

        if (persError) throw persError;
    }

    static mapSales(data: any): any {
        return HfzSupabaseApi.parseData(data, [
            ["sale_article", "saleArticles"]
        ]);
    }

    static parseData(data: any, propertiesToRename = undefined as undefined | Array<[string, string]>): any {
        if (!data) return data;
        data = HfzSupabaseApi.mapDates(data);
        propertiesToRename?.forEach(([oldName, newName]) => {
            data = HfzSupabaseApi.renameProperty(data, oldName, newName);
        });
        return data;
    }

    static mapDates(data: any): any {
        if (!data) return data;
        if (Array.isArray(data))
            return data.map(HfzSupabaseApi.mapDates);

        const possibleColumns = ["saleDate", "payDate"];
        for (const col of possibleColumns) {
            if (data[col]) {
                data[col] = new Date(data[col]);
            }
        }
        return data;
    }

    static renameProperty(data: any, oldName: string, newName: string): any {
        if (!data) return data;
        if (Array.isArray(data))
            return data.map(x => HfzSupabaseApi.renameProperty(x, oldName, newName));

        if (data[oldName]) {
            data[newName] = data[oldName];
            delete data[oldName];
        }
        return data;
    }

    async createPerson(person: Partial<IPerson>): Promise<IPerson> {
        const supabase = this.supabase;
        const payload = {
            ...person,
            credit: 0,
            saleCount: 0,
            saleSum: 0,
            og: this.og
        } as any;
        const {data, error} = await supabase
            .from('person')
            .insert(payload)
            .select('*')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.mapDates(data) as IPerson;
    }

    async updatePerson(person: IPerson): Promise<IPerson> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('person')
            .update({
                firstName: person.firstName,
                lastName: person.lastName,
                dogNames: person.dogNames,
                phone: person.phone,
                email: person.email,
                isMember: person.isMember,
                isActive: person.isActive,
                personGroup: person.personGroup,
                info: person.info
            })
            .eq('og', this.og)
            .eq('id', person.id)
            .select('*')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.mapDates(data) as IPerson;
    }

    async createArticle(article: Partial<IArticle>): Promise<IArticle> {
        const supabase = this.supabase;
        const payload = {...article, og: this.og} as any;
        const {data, error} = await supabase
            .from('article')
            .insert(payload)
            .select('*')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.mapDates(data) as IArticle;
    }

    async updateArticle(article: IArticle): Promise<IArticle> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('article')
            .update({
                title: article.title,
                type: (article as any).type, // ensure type is passed through
                price: article.price,
                isFavorite: article.isFavorite,
                isActive: article.isActive,
            })
            .eq('og', this.og)
            .eq('id', article.id)
            .select('*')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.mapDates(data) as IArticle;
    }

    async getArticle(id: IId): Promise<IArticle> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('article')
            .select('*')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IArticle;
    }

    async getArticles(): Promise<Array<IArticle>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('article')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IArticle>;
    }

    async getPerson(id: IId): Promise<IPerson> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('person')
            .select('*')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IPerson;
    }

    async getPersons(): Promise<Array<IPerson>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('person')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IPerson>;
    }

    async getPersonCreditHistory(id: IId): Promise<Array<ICreditHistory>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('credit_history')
            .select('*')
            .eq('personId', id.id);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<ICreditHistory>;
    }

    async getPersonCourseHistory(id: IId): Promise<Array<ICourseHistory>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('course_history')
            .select('*')
            .eq('personId', id.id);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<ICourseHistory>;
    }

    async getPersonSaleHistory(id: IId): Promise<Array<ISale>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('sale')
            .select('*')
            .eq('personId', id.id);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<ISale>;
    }

    async getPersonMergedHistory(id: IId): Promise<Array<IMergedPersonHistory>> {
        const creditHistory = await this.getPersonCreditHistory(id);
        const courseHistory = await this.getPersonCourseHistory(id);
        const saleHistory = await this.getPersonSaleHistory(id);

        const dates = [
            ...new Set(creditHistory?.map(x => moment(x.date).format('YYYY-MM-DD'))),
            ...new Set(courseHistory?.map(x => moment(x.date).format('YYYY-MM-DD'))),
            ...new Set(saleHistory?.map(x => moment(x.saleDate).format('YYYY-MM-DD'))),
        ];
        const distinctDates = [...new Set(dates)];
        
        return distinctDates.map(date => {
            const matchingCreditHistory = creditHistory.filter(x => moment(x.date).format("YYYY-MM-DD") === date);
            const matchingCourseHistory = courseHistory.filter(x => moment(x.date).format("YYYY-MM-DD") === date);
            const matchingSaleHistory = saleHistory.filter(x => moment(x.saleDate).format("YYYY-MM-DD") === date);
            return {
                date: moment(date).toDate(),
                creditBought: matchingCreditHistory?.filter(cr => cr.credit > 0).map(cr => cr.credit ?? 0).reduce((a, b) => a + b, 0) ?? 0,
                creditUsed: matchingCreditHistory?.filter(cr => cr.credit < 0).map(cr => cr.credit ?? 0).reduce((a, b) => a + b, 0) ?? 0,
                coursesBought: matchingCourseHistory?.filter(cr=> cr.courses > 0).map(cr => cr.courses ?? 0).reduce((a, b) => a + b, 0) ?? 0,
                coursesUsed: matchingCourseHistory?.filter(cr => cr.courses < 0).map(cr => cr.courses ?? 0).reduce((a, b) => a + b, 0) ?? 0,
                saleSum: matchingSaleHistory?.filter(sh => sh.articleSum).map(sh => sh.articleSum ?? 0).reduce((a, b) => a + b, 0) ?? 0,
                creditHistory: matchingCreditHistory,
                courseHistory: matchingCourseHistory,
                saleHistory: matchingSaleHistory
            } as IMergedPersonHistory;
        });
    }

    async getRobCourse(id: IId): Promise<IRobCourse> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('rob_course')
            .select('*')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IRobCourse;
    }

    async getRobCourses(): Promise<Array<IRobCourse>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('rob_course')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IRobCourse>;
    }

    async getSale(id: IId): Promise<ISale> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('sale')
            .select('*, person(*), sale_article(*, article(*))')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        if (error) throw error;
        return HfzSupabaseApi.mapSales(data) as ISale;
    }


    async getNewSaleForPerson(personId: IId): Promise<ISale> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('sale')
            .select('*, person(*), sale_article(*, article(*))')
            .eq("og", this.og)
            .eq("personId", personId.id)
            .is("payDate", null)
            .single();

        if (error && error.code === 'PGRST116') {
            // No unpaid sale found, return empty sale with person
            return {
                id: 0,
                additionalCredit: 0,
                articleSum: 0,
                extId: '',
                given: 0,
                inclTip: 0,
                personName: '',
                saleDate: new Date(),
                toPay: 0,
                toReturn: 0,
                usedCredit: false,
                saleArticles: [],
                person: await this.getPerson(personId)
            } as ISale;
        }

        if (error) throw error;
        return HfzSupabaseApi.mapSales(data) as ISale;
    }
    async getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>> {
        const supabase = this.supabase;
        
        console.log("getSales", this.og);

        let query = supabase.from('sale')
            .select('*, person(*), sale_article(*, article(*))')
            .eq("og", this.og);

        if (dateFrom && dateTo) {
            query = query.gte('saleDate', dateFrom);
            query = query.lte('saleDate', dateTo);
        } else if (dateFrom)
            query = query.or("saleDate.eq." + dateFrom + ",payDate.is.null");

        const {data, error} = await query;
        if (error) throw error;

        return HfzSupabaseApi.mapSales(data) as Array<ISale>;
    }

    async getTheme(): Promise<"light" | "dark" | "system"> {
        const user = await this.getUser();
        return user.theme;
    }

    async getUser(): Promise<IUser> {
        const { data: { user } } = await this.supabase.auth.getUser();
        console.log("getUser", user);
        if (!user) {
            return {
                theme: "system"
            };
        }

        const { data: userData, error } = await this.supabase
            .from('users')
            .select('theme')
            .maybeSingle();
        
        if (error) {
            console.error("Error fetching user data", error);
        }
        
        console.log("getUserData " + user.email, userData);

        return {
            theme: userData?.theme ?? "system",
            email: user.email,
            name: user.user_metadata?.full_name,
            avatarUrl: user.user_metadata?.avatar_url,
            lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
        };
    }
}
