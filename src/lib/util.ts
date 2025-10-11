import moment from "moment";

export class Util {
    static formatDate(date: Date) {
        return moment(date).format('DD.MM.YYYY');
    }
    
    static formatCurrency(val: string|number, addCurrency: boolean = true) {
        if(val === null || val === undefined) 
            return "";
        
        const minimumFractionDigits = 2;
        const maximumFractionDigits = 2;
        const locale = "de-DE";
        
        const format = (val: number) => 
           val.toLocaleString(locale, {minimumFractionDigits, maximumFractionDigits});
        
        if(typeof val === "string") 
           return "€ "+format(parseFloat(val)); 
        return "€ "+format(val);
    }
    
    static mapClass(baseClass: string, expression:boolean, trueClass:string, falseClass:string) {
        return `${baseClass} ${expression ? trueClass : falseClass}`;
    }
}