import type {
    IArticle,
    ICourseHistory,
    ICreditHistory,
    IHfzApi,
    IId,
    IMergedPersonHistory,
    IPerson,
    IPersonSaleAggregate,
    IRobCourse,
    ISale,
    ISoldArticleAggregate,
    IUser
} from "$lib/data/hfzApi";
import {type SupabaseClient} from '@supabase/supabase-js';
import {moment} from "$lib/util";

export class HfzSupabaseApi implements IHfzApi {

    supabase: SupabaseClient;
    og: number;

    constructor(supabase: SupabaseClient, og: number) {
        this.supabase = supabase;
        this.og = og;
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

        const possibleColumns = ["saleDate", "payDate", "date", "timestamp"];
        for (const col of possibleColumns) {
            if (data[col]) {
                data[col] = new Date(data[col]);
            }
        }

        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof Date)) {
                data[key] = HfzSupabaseApi.mapDates(data[key]);
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

    async addPersonCredit(personId: IId, amount: number, date: Date, saleId?: IId): Promise<void> {
        const supabase = this.supabase;
        const payload: any = {
            personId: personId.id,
            credit: amount,
            date: date,
            isBought: amount > 0,
        };

        if (saleId)
            payload.saleId = saleId.id;

        console.log("Adding credit history entry", payload);

        const {error} = await supabase
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
        const {error} = await supabase
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

    async getPersonsWithCourseHistory(days: number): Promise<Array<IPersonWithHistory>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('person')
            .select('*, course_history!inner(*)')
            .eq("og", this.og);

        if (error) throw error;

        const ret = HfzSupabaseApi.parseData(data, [
            ["course_history", "courseHistory"]
        ]);
        return ret as Array<IPersonWithHistory>;
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
                coursesBought: matchingCourseHistory?.filter(cr => cr.courses > 0).map(cr => cr.courses ?? 0).reduce((a, b) => a + b, 0) ?? 0,
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
            .select('*, rob_course_person(*)')
            .eq("og", this.og)
            .eq('id', id.id)
            .single();

        const ret = HfzSupabaseApi.parseData(data, [
            ["rob_course_person", "persons"]
        ]);
        return ret as IRobCourse;
    }

    async getRobCourseByLink(link: string): Promise<IRobCourse> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('rob_course')
            .select('*, rob_course_person(*)')
            .eq('link', link)
            .single();

        if (error) throw error;

        const ret = HfzSupabaseApi.parseData(data, [
            ["rob_course_person", "persons"]
        ]);
        return ret as IRobCourse;
    }

    async getRobCourses(): Promise<Array<IRobCourse>> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('rob_course')
            .select('*, rob_course_person(*)')
            .eq("og", this.og);

        const ret = HfzSupabaseApi.parseData(data, [
            ["rob_course_person", "persons"]
        ]);
        return ret as Array<IRobCourse>;
    }

    async createRobCourse(robCourse: Partial<IRobCourse>): Promise<IRobCourse> {
        const supabase = this.supabase;
        if (!robCourse.link) {
            robCourse.link = Math.random().toString(36).substring(2, 8);
        }
        const payload = {...robCourse, og: this.og} as any;
        delete payload.persons;

        const {data, error} = await supabase
            .from('rob_course')
            .insert(payload)
            .select('*, rob_course_person(*)')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.parseData(data, [
            ["rob_course_person", "persons"]
        ]) as IRobCourse;
    }

    async updateRobCourse(robCourse: IRobCourse): Promise<IRobCourse> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('rob_course')
            .update({
                date: robCourse.date,
                maxPersons: robCourse.maxPersons,
                link: robCourse.link
            })
            .eq('og', this.og)
            .eq('id', robCourse.id)
            .select('*, rob_course_person(*)')
            .single();
        if (error) throw error;
        return HfzSupabaseApi.parseData(data, [
            ["rob_course_person", "persons"]
        ]) as IRobCourse;
    }

    async deleteRobCourse(id: IId): Promise<void> {
        const supabase = this.supabase;
        // persons are deleted by cascade or manually? 
        // looking at the schema there are no foreign key constraints mentioned in the json but usually they are there.
        // I will just delete the course, assuming cascade or that we don't care for now as per instructions.
        const {error} = await supabase
            .from('rob_course')
            .delete()
            .eq('og', this.og)
            .eq('id', id.id);
        if (error) throw error;
    }

    async addRobCoursePerson(robCourseId: number, personName: string, dogName: string): Promise<void> {
        const supabase = this.supabase;
        const {error} = await supabase
            .from('rob_course_person')
            .insert({
                robCourseId,
                personName,
                dogName
            });
        if (error) throw error;
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


    async saveSale(sale: ISale): Promise<ISale> {
        const supabase = this.supabase;
        let saleId = sale.id;
        const salePayload: any = {
            articleSum: sale.articleSum,
            toPay: sale.articleSum,
            given: sale.given ?? 0,
            inclTip: sale.inclTip ?? 0,
            toReturn: sale.toReturn ?? 0,
            og: this.og
        };

        if (sale.person) {
            const person = await this.getPerson(sale.person);
            salePayload.personId = person.id;
            salePayload.personName = (person.lastName + " " + person.firstName).trim();
        } else if (!sale.personName)
            salePayload.personName = "Barverkauf";

        console.log("Saving salePayload", salePayload);

        if (!saleId) {
            salePayload.saleDate = new Date();
            // set mandatory values for inserting
            salePayload.given = 0;
            salePayload.inclTip = 0;
            salePayload.toReturn = 0;
            salePayload.usedCredit = false; 
            salePayload.addAdditionalCredit = 0;

            const {data, error} = await supabase.from('sale').insert(salePayload).select().single();
            if (error) {
                console.error("Error inserting sale", error);
                throw error;
            }
            saleId = data.id;
        } else {
            const {error} = await supabase.from('sale').update(salePayload).eq('id', saleId);
            if (error) {
                console.error("Error updating sale", error);
                throw error;
            }
        }

        const {data: existingArticles, error: fetchError} = await supabase
            .from('sale_article')
            .select('id, articleId')
            .eq('saleId', saleId);

        if (fetchError) {
            console.error("Error fetching existing sale articles", fetchError);
            throw fetchError;
        }

        const existingMap = new Map<number, number>(); // articleId -> sale_article_id
        existingArticles.forEach((row: any) => existingMap.set(row.articleId, row.id));

        const processedIds: number[] = [];

        if (sale.saleArticles) {
            for (const sa of sale.saleArticles) {
                // Handle both object structure and potential flat articleId property
                const articleId = (sa as any).articleId ?? sa.article?.id;

                if (!articleId) {
                    console.warn("Skipping sale article without articleId", sa);
                    continue;
                }

                const articlePayload = {
                    saleId: saleId,
                    articleId: articleId,
                    amount: sa.amount,
                    articlePrice: sa.articlePrice,
                    articleTitle: sa.articleTitle,
                    og: this.og
                };

                const existingId = existingMap.get(articleId);

                if (existingId) {
                    const {
                        data,
                        error
                    } = await supabase.from('sale_article').update(articlePayload).eq('id', existingId).select().single();
                    console.log("Updated sale article", error);
                    if (error) throw error;
                    processedIds.push(data.id);
                } else {
                    const {data, error} = await supabase.from('sale_article').insert(articlePayload).select().single();
                    console.log("insert sale article", error);
                    if (error) throw error;
                    processedIds.push(data.id);
                }
            }
        }

        const existingIds = existingArticles.map((x: any) => x.id);
        const toDelete = existingIds.filter(id => !processedIds.includes(id));

        if (toDelete.length > 0) {
            const {error} = await supabase.from('sale_article').delete().in('id', toDelete);
            if (error) throw error;
        }

        return this.getSale({id: saleId});
    }

    async paySale(sale: ISale): Promise<ISale> {
        const supabase = this.supabase;
        let saleId = sale.id;
        const salePayload: any = {
            personId: (sale as any).personId,
            toPay: sale.toPay,
            given: sale.given ?? 0,
            inclTip: sale.inclTip ?? 0,
            toReturn: sale.toReturn ?? 0,
            addAdditionalCredit: sale.addAdditionalCredit ?? 0,
            usedCredit: sale.usedCredit ?? false,
            payDate: sale.payDate
        };

        console.log("Saving salePayload", salePayload);
        const {error} = await supabase.from('sale').update(salePayload).eq('id', saleId);
        if (error) {
            console.error("Error updating sale", error);
            throw error;
        }

        const creditChange = ((sale as any).newCredit ?? 0) - ((sale as any).oldCredit ?? 0);
        console.log("Credit change for sale", saleId, ":", creditChange);

        if (salePayload.personId && creditChange != null && sale.payDate) {
            console.log("call addPErsonCredit")
            await this.addPersonCredit({id: salePayload.personId}, creditChange, sale.payDate, {id: saleId});
        }
        return this.getSale({id: saleId});
    }

    async paySalesWithCredit(date?: string, saleId?: number): Promise<void> {
        let salesToPay: Array<ISale> = [];

        if (saleId) {
            const sale = await this.getSale({id: saleId});
            if (!sale.payDate && sale.person && sale.person.credit >= sale.articleSum) {
                salesToPay = [sale];
            }
        } else if (date) {
            const allSales = await this.getSales(date);
            salesToPay = allSales.filter(s => {
                const isOnDate = moment(s.saleDate).isSame(moment(date), "day") ||
                    (moment(date).isSame(moment(), "day") && !s.payDate);
                return isOnDate && !s.payDate && s.person && s.person.credit >= s.articleSum;
            });
        }

        for (const sale of salesToPay) {
            const saleToUpdate: any = {
                id: sale.id,
                toPay: 0,
                given: 0,
                inclTip: 0,
                toReturn: 0,
                oldCredit: sale.person!.credit,
                newCredit: sale.person!.credit - sale.articleSum,
                addAdditionalCredit: 0,
                usedCredit: true,
                personId: sale.person!.id,
                payDate: new Date()
            };
            await this.paySale(saleToUpdate);
        }
    }

    async deleteSale(id: IId): Promise<void> {
        const supabase = this.supabase;

        // Get credit history entries to undo credit changes on persons
        const {data: creditHistory, error: creditError} = await supabase
            .from('credit_history')
            .select('personId, credit')
            .eq('saleId', id.id);

        if (creditError) throw creditError;

        if (creditHistory) {
            for (const historyEntry of creditHistory) {
                if (historyEntry.personId && historyEntry.credit) {
                    const person = await this.getPerson({id: historyEntry.personId});
                    const newCredit = (person.credit ?? 0) - historyEntry.credit;
                    const {error: personError} = await supabase
                        .from('person')
                        .update({credit: newCredit})
                        .eq('id', historyEntry.personId)
                        .eq('og', this.og);
                    if (personError) throw personError;
                }
            }
        }

        await supabase.from('sale_article').delete().eq('saleId', id.id);
        await supabase.from('credit_history').delete().eq('saleId', id.id);
        const {error} = await supabase.from('sale').delete().eq('id', id.id);
        if (error) throw new Error(error.message);
    }

    async getNewSaleForPerson(personId?: IId): Promise<ISale> {
        const supabase = this.supabase;
        const {data, error} = await supabase
            .from('sale')
            .select('*, person(*), sale_article(*, article(*))')
            .eq("og", this.og)
            .eq("personId", personId?.id ?? -1)
            .is("payDate", null)
            .single();

        if (error && error.code === 'PGRST116') {
            // No unpaid sale found, return empty sale with person
            return {
                id: 0,
                addAdditionalCredit: 0,
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
                person: personId ? await this.getPerson(personId) : null
            } as ISale;
        }

        if (error) throw error;
        return HfzSupabaseApi.mapSales(data) as ISale;
    }

    async getSales(dateFrom: string, dateTo?: string): Promise<Array<ISale>> {
        const supabase = this.supabase;

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

    async getTopSoldArticlesBySaleId(saleId: IId, dateFrom?: Date): Promise<Array<ISoldArticleAggregate>> {
        const supabase = this.supabase;
        let query = supabase
            .from('sale')
            .select('personId')
            .eq("id", saleId.id)
            .single();
        const {data, error} = await query;
        if (error) throw error;
        if (!data.personId) return [];
        return await this.getTopSoldArticles({id: data.personId}, dateFrom);
    }

    async getTopSoldArticles(personId?: IId, dateFrom?: Date): Promise<Array<ISoldArticleAggregate>> {
        const supabase = this.supabase;

        let query = supabase
            .from('sale_article')
            .select('amount, article(id), sale!inner(saleDate, personId, og)')
            .eq("sale.og", this.og);

        const fromDate = dateFrom ?? moment().subtract(365, 'days').toDate();
        query = query.gte('sale.saleDate', fromDate.toISOString());

        if (personId)
            query = query.eq('sale.personId', personId.id);

        const {data, error} = await query;
        if (error) throw error;

        const map = new Map<number, number>();
        (data as any[]).forEach((row: any) => {
            const articleId = row.article?.id;
            if (!articleId) return;

            const amount = row.amount;
            const current = map.get(articleId) || 0;
            map.set(articleId, current + amount);
        });

        return Array.from(map.entries())
            .map(([articleId, count]) => ({articleId, count}))
            .sort((a, b) => b.count - a.count);
    }

    async getTopPersonsBySales(dateFrom?: Date): Promise<Array<IPersonSaleAggregate>> {
        const supabase = this.supabase;

        let query = supabase
            .from('sale')
            .select('personId, saleDate')
            .eq("og", this.og);

        const fromDate = dateFrom ?? moment().subtract(365, 'days').toDate();
        query = query.gte('saleDate', fromDate.toISOString());

        const {data, error} = await query;
        if (error) throw error;

        const map = new Map<number, number>();
        (data as any[]).forEach((row: any) => {
            const personId = row.personId;
            if (!personId) return;
            const current = map.get(personId) || 0;
            map.set(personId, current + 1);
        });

        return Array.from(map.entries())
            .map(([personId, count]) => ({personId, count}))
            .sort((a, b) => b.count - a.count);
    }

    async updateUserTheme(email: string, theme: string): Promise<void> {
        const {error} = await this.supabase
            .from('users')
            .update({theme: theme})
            .eq('login', email);

        if (error) throw error;
    }

    async getTheme(): Promise<"light" | "dark" | "system"> {
        const user = await this.getUser();
        return user.theme;
    }

    async getUser(): Promise<IUser> {
        const {data: {user}} = await this.supabase.auth.getUser();
        if (!user) {
            return {
                theme: "system"
            };
        }

        const {data: userData, error} = await this.supabase
            .from('users')
            .select('theme, admin, og')
            .eq('login', user.email)
            .maybeSingle();

        if (error) {
            console.error("Error fetching user data", error);
        }

        return {
            theme: userData?.theme ?? "system",
            email: user.email,
            name: user.user_metadata?.full_name,
            avatarUrl: user.user_metadata?.avatar_url,
            lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
            admin: userData?.admin,
            og: userData?.og
        };
    }

    async getUnassignedUsers(): Promise<Array<IUser>> {
        const {data, error} = await this.supabase
            .from('users')
            .select('*')
            .is('og', null);

        if (error) throw error;

        return data.map((u: any) => ({
            theme: u.theme,
            email: u.login,
            admin: u.admin,
            og: u.og
        }));
    }

    async assignUserToOg(email: string, og: number): Promise<void> {
        const {error} = await this.supabase
            .from('users')
            .update({og: og})
            .eq('login', email);

        if (error) {
            console.error("assignUserToOg error", error);
            throw error;
        }
    }
}
