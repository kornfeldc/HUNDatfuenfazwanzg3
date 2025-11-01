import type {
    IArticle,
    ICourseHistory,
    ICreditHistory,
    IHfzApi,
    IId,
    IMergedPersonHistory,
    IPerson,
    IRobCourse,
    ISale
} from "$lib/data/hfzApi";
import {createClient} from '@supabase/supabase-js';
import moment from "moment";

export class HfzSupabaseApi implements IHfzApi {

    static supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    static supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

    og = 125; // todo load via user

    // @ts-ignore
    static getClient(): SupabaseClient {
        return createClient(this.supabaseUrl, this.supabaseKey);
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
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
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
            })
            .eq('og', this.og)
            .eq('id', person.id)
            .select('*')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.mapDates(data) as IPerson;
    }

    async createArticle(article: Partial<IArticle>): Promise<IArticle> {
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('article')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IArticle>;
    }

    async getPerson(id: IId): Promise<IPerson> {
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('person')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IPerson>;
    }

    async getPersonCreditHistory(id: IId): Promise<Array<ICreditHistory>> {
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('credit_history')
            .select('*')
            .eq('personId', id.id);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<ICreditHistory>;
    }

    async getPersonCourseHistory(id: IId): Promise<Array<ICourseHistory>> {
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('course_history')
            .select('*')
            .eq('personId', id.id);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<ICourseHistory>;
    }

    async getPersonSaleHistory(id: IId): Promise<Array<ISale>> {
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
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
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('rob_course')
            .select('*')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IRobCourse>;
    }

    async getSale(id: IId): Promise<ISale> {
        const supabase = HfzSupabaseApi.getClient();
        const {data, error} = await supabase
            .from('sale')
            .select('*, person(*), sale_article(*, article(*))')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        if (error) throw error;
        return HfzSupabaseApi.mapSales(data) as ISale;
    }

    async getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>> {
        const supabase = HfzSupabaseApi.getClient();

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
}
