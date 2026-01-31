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

        if (data[oldName] !== undefined) {
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
        await this.logAction('add_credit', 'person', personId.id, `${amount}€ for ${person.firstName} ${person.lastName}`);
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
        await this.logAction('add_course', 'person', personId.id, `${amount} courses for ${person.firstName} ${person.lastName}`);
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
        const result = HfzSupabaseApi.mapDates(data) as IPerson;
        await this.logAction('create', 'person', result.id, `${result.firstName} ${result.lastName}`);
        return result;
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
        const result = HfzSupabaseApi.mapDates(data) as IPerson;
        await this.logAction('update', 'person', result.id, `${result.firstName} ${result.lastName}`);
        return result;
    }

    async deletePerson(id: IId): Promise<void> {
        const supabase = this.supabase;
        const {error} = await supabase
            .from('person')
            .delete()
            .eq('og', this.og)
            .eq('id', id.id);
        if (error) throw error;
        await this.logAction('delete', 'person', id.id, ``);
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
        const result = HfzSupabaseApi.mapDates(data) as IArticle;
        await this.logAction('create', 'article', result.id, result.title);
        return result;
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
        const result = HfzSupabaseApi.mapDates(data) as IArticle;
        await this.logAction('update', 'article', result.id, result.title);
        return result;
    }

    async deleteArticle(id: IId): Promise<void> {
        const supabase = this.supabase;
        const {error} = await supabase
            .from('article')
            .delete()
            .eq('og', this.og)
            .eq('id', id.id);
        if (error) throw error;
        await this.logAction('delete', 'article', id.id, ``);
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

    async deleteRobCoursePerson(id: number): Promise<void> {
        const supabase = this.supabase;
        const {error} = await supabase
            .from('rob_course_person')
            .delete()
            .eq('id', id);
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

        const result = await this.getSale({id: saleId});
        await this.logAction(sale.id ? 'update' : 'create', 'sale', saleId, `Person: ${result.personName}, Sum: ${result.articleSum}€`);
        return result;
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
        const result = await this.getSale({id: saleId});
        await this.logAction('pay_sale', 'sale', saleId, `Amount: ${result.toPay}€, Person: ${result.personName}`);
        return result;
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
        await this.logAction('delete', 'sale', id.id, ``);
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

    async getAvailableYears(): Promise<Array<string>> {
        const {data, error} = await this.supabase
            .from("sale")
            .select("saleDate")
            .eq("og", this.og)
            .order("saleDate", {ascending: false});

        if (error) {
            console.error("getAvailableYears error", error);
            return [];
        }
        if (!data) return [];
        const years = new Set<string>();
        data.forEach(s => {
            if (s.saleDate) {
                years.add(new Date(s.saleDate).getFullYear().toString());
            }
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }

    private async logAction(action: string, entityType: string, entityId: string | number, details: string): Promise<void> {
        try {
            const user = await this.getUser();
            const {error} = await this.supabase
                .from('history')
                .insert({
                    userEmail: user.email,
                    action: action,
                    entityType: entityType,
                    entityId: entityId.toString(),
                    details: details,
                    og: this.og
                });
            if (error) {
                console.error("Error logging action", error);
            }
        } catch (e) {
            console.error("Failed to log action", e);
        }
    }

    async getHistory(entityType?: string, entityId?: string | number): Promise<Array<IHistory>> {
        let query = this.supabase
            .from('history')
            .select('*')
            .eq('og', this.og);

        if (entityType) {
            query = query.eq('entityType', entityType);
        }
        if (entityId) {
            query = query.eq('entityId', entityId.toString());
        }

        const {data, error} = await query.order('timestamp', {ascending: false});

        if (error) {
            console.error("getHistory error", error);
            return [];
        }

        return data.map((h: any) => ({
            id: h.id,
            timestamp: new Date(h.timestamp),
            userEmail: h.userEmail,
            action: h.action,
            entityType: h.entityType,
            entityId: h.entityId,
            details: h.details,
            og: h.og
        }));
    }

    async getStatisticsArticles(year?: string): Promise<Array<{ label: string; value: number }>> {
        const fetchAll = async (query: any) => {
            let allData: any[] = [];
            let from = 0;
            const step = 1000;
            while (true) {
                const {data, error} = await query.range(from, from + step - 1);
                if (error) throw error;
                if (!data || data.length === 0) break;
                allData = [...allData, ...data];
                if (data.length < step) break;
                from += step;
            }
            return allData;
        };

        let query = this.supabase
            .from("sale_article")
            .select("articleTitle, amount")
            .eq("og", this.og);

        if (year && year !== "all") {
            const start = `${year}-01-01`;
            const end = `${year}-12-31`;
            const {data: sales} = await this.supabase.from("sale").select("id").eq("og", this.og).gte("saleDate", start).lte("saleDate", end);
            if (!sales || sales.length === 0) return [];
            query = query.in("saleId", sales.map(s => s.id));
        }

        try {
            const data = await fetchAll(query);

            const map = new Map<string, number>();
            data.forEach(item => {
                map.set(item.articleTitle, (map.get(item.articleTitle) || 0) + item.amount);
            });

            return Array.from(map.entries())
                .map(([label, value]) => ({label, value}))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
        } catch (error) {
            console.error("getStatisticsArticles error", error);
            return [];
        }
    }

    async getStatisticsSales(year?: string): Promise<Array<{ label: string; count: number; volume: number }>> {
        const fetchAll = async (query: any) => {
            let allData: any[] = [];
            let from = 0;
            const step = 1000;
            while (true) {
                const {data, error} = await query.range(from, from + step - 1);
                if (error) throw error;
                if (!data || data.length === 0) break;
                allData = [...allData, ...data];
                if (data.length < step) break;
                from += step;
            }
            return allData;
        };

        let query = this.supabase
            .from("sale")
            .select("saleDate, articleSum")
            .eq("og", this.og);

        if (year && year !== "all") {
            query = query.gte("saleDate", `${year}-01-01`).lte("saleDate", `${year}-12-31`);
        }

        try {
            const data = await fetchAll(query);

            const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
            const stats = months.map(m => ({label: m, count: 0, volume: 0}));

            data.forEach(sale => {
                if (sale.saleDate) {
                    const date = new Date(sale.saleDate);
                    const monthIdx = date.getMonth();
                    stats[monthIdx].count++;
                    stats[monthIdx].volume += Number(sale.articleSum) || 0;
                }
            });

            return stats;
        } catch (error) {
            console.error("getStatisticsSales error", error);
            return [];
        }
    }

    async getStatisticsPersonSales(year?: string): Promise<Array<{ label: string; value: number }>> {
        const fetchAll = async (query: any) => {
            let allData: any[] = [];
            let from = 0;
            const step = 1000;
            while (true) {
                const {data, error} = await query.range(from, from + step - 1);
                if (error) throw error;
                if (!data || data.length === 0) break;
                allData = [...allData, ...data];
                if (data.length < step) break;
                from += step;
            }
            return allData;
        };

        let query = this.supabase
            .from("sale")
            .select("personName, articleSum")
            .eq("og", this.og);

        if (year && year !== "all") {
            query = query.gte("saleDate", `${year}-01-01`).lte("saleDate", `${year}-12-31`);
        }

        try {
            const data = await fetchAll(query);

            const map = new Map<string, number>();
            data.forEach(sale => {
                const name = sale.personName || "Unbekannt";
                map.set(name, (map.get(name) || 0) + (Number(sale.articleSum) || 0));
            });

            return Array.from(map.entries())
                .map(([label, value]) => ({label, value}))
                .sort((a, b) => b.value - a.value)
                .slice(0, 15); // Top 15 persons
        } catch (error) {
            console.error("getStatisticsPersonSales error", error);
            return [];
        }
    }

}
