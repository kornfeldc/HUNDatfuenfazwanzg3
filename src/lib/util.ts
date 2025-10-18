import moment from "moment";

export class Util {
    static formatDate(date: Date) {
        return moment(date).format('DD.MM.YYYY');
    }
    
    static formatCurrency(val: string|number, addCurrency: boolean = true, decimals = 2) {
        if(val === null || val === undefined) 
            return "";
        
        const minimumFractionDigits = decimals;
        const maximumFractionDigits = decimals;
        const locale = "de-DE";
        
        const format = (val: number) =>
            `${addCurrency ? "€ " : ""}${val.toLocaleString(locale, {minimumFractionDigits, maximumFractionDigits})}`;
        return typeof val === "string" ? format(parseFloat(val)) : format(val);
    }
    
    static mapClass(baseClass: string, expression:boolean, trueClass:string, falseClass = "") {
        return `${baseClass} ${expression ? trueClass : falseClass}`;
    }


    static urlParamToNumber(url: URL, param: string): number | undefined {
        const str = url.searchParams.get(param);
        if (str && str !== 'null' && str !== 'undefined') return parseInt(str, 10);
    }

    static isGermanNumber(value: string): boolean {
        const regExp = /^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/i;
        return regExp.test(value);
    }

    static parseLocalizedFloat(value: string): number | undefined {
        if (Util.isGermanNumber(value)) return parseFloat(value.replace('.', '').replace(',', '.'));
        return parseFloat(value);
    }

    static parseFormData(
        formData: FormData,
        convertes?: Array<{ properties: Array<string>; method: (value: any) => any }>
    ): any {
        let ret = {};
        formData.forEach((value, key) => {
            let val = formData.get(key);
            if (!val) return;
            convertes?.forEach((converter) => {
                if (converter.properties?.includes(key)) val = converter.method(val);
            });
            (ret as any)[key] = val;
        });
        return ret;
    }

    static createFormDataFromJson(jsonObject: any): FormData {
        const formData = new FormData();

        for (const key in jsonObject) {
            if (jsonObject.hasOwnProperty(key)) {
                const value = jsonObject[key];

                // Handle array or nested object if needed
                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        formData.append(`${key}[${index}]`, item);
                    });
                } else if (typeof value === 'object' && value !== null) {
                    // Serialize nested objects as JSON strings
                    formData.append(key, JSON.stringify(value));
                } else if (value) {
                    // Simple key-value pair
                    formData.append(key, value);
                }
            }
        }
        return formData;
    }
}