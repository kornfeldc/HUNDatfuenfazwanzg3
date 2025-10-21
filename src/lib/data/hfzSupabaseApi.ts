import type {IArticle, IHfzApi, IId, IPerson, IRobCourse, ISale} from "$lib/data/hfzApi";
import {createClient} from '@supabase/supabase-js';

export class HfzSupabaseApi implements IHfzApi {

    static supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    static supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
    
    og = 125; // todo load via user

    // @ts-ignore
    static getClient(): SupabaseClient {
        return createClient(this.supabaseUrl, this.supabaseKey);
    }

    async getArticle(id: IId): Promise<IArticle> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('article')
            .select('*')
            .eq("og",this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IArticle;
    }

    async getArticles(): Promise<Array<IArticle>> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('article')
            .select('*')
            .eq("og",this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IArticle>;
    }

    async getPerson(id: IId): Promise<IPerson> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('person')
            .select('*')
            .eq("og",this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IPerson;
    }

    async getPersons(): Promise<Array<IPerson>> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('person')
            .select('*')
            .eq("og",this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IPerson>;
    }

    async getRobCourse(id: IId): Promise<IRobCourse> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('rob_course')
            .select('*')
            .eq("og",this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as IRobCourse;
    }

    async getRobCourses(): Promise<Array<IRobCourse>> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('rob_course')
            .select('*')
            .eq("og",this.og);

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as Array<IRobCourse>;
    }

    async getSale(id: IId): Promise<ISale> {
        const supabase = HfzSupabaseApi.getClient();
        const { data, error } = await supabase
            .from('sale')
            .select('*')
            .eq("og",this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.mapDates(data);
        return ret as ISale;
    }

    async getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>> {
        const supabase = HfzSupabaseApi.getClient();
        let query = supabase.from('sale')
            .select('*')
            .eq("og",this.og);
        
        if (dateFrom && dateTo) {
            query = query.gte('saleDate', dateFrom);
            query = query.lte('saleDate', dateTo);
        }
        else if (dateFrom)
            query = query.or("saleDate.eq."+dateFrom+",payDate.is.null");
            //query = query.eq('saleDate', dateFrom);
        
        console.log("getSales query", {dateFrom,dateTo});
        const { data, error } = await query; 
        
        let ret = HfzSupabaseApi.mapDates(data);
        ret.forEach(r=> r.saleArticles = []);
        console.log("getSales count", ret.length);
        return ret as Array<ISale>;
    }
    
    static mapDates(data: any): any {
        if(Array.isArray(data))
            return data.map(HfzSupabaseApi.mapDates);
        
        const possibleColumns = ["saleDate", "payDate"];
        for(const col of possibleColumns) {
            if(data[col]) {
                data[col] = new Date(data[col]);
            }
        }
        return data;
    }
}
