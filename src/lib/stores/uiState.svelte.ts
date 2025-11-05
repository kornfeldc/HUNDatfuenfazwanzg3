export type UiState = {
    showNavBar: boolean;
    showActions: boolean;
    showSearchBar: boolean;
    isMobileDevice: boolean;
    showPlaceAtBottomOnTop: () => boolean,
    setNavSearch: (showSearch: boolean) => void;
    
    routes: string[];
    pushRoute: (path: string) => void;
    getLastRoute: (fragment: string) => string | undefined;
    getLastRouteSmart: () => string | undefined;
};

export const uiState = $state<UiState>({
    showNavBar: true,
    showActions: true,
    showSearchBar: false,
    isMobileDevice: false,
    showPlaceAtBottomOnTop: () => 
        uiState.showSearchBar && uiState.isMobileDevice,
    setNavSearch:(showSearch:boolean)=> {
        uiState.showNavBar = !showSearch;
        uiState.showActions = !showSearch;
        uiState.showSearchBar = showSearch;
    },
    
    routes: [] as string[],
    pushRoute(path: string) {
        if (!path) return;
        const last = uiState.routes[uiState.routes.length - 1];
        if (last !== path)
            uiState.routes = [...uiState.routes ?? [], path];
        console.log("uiState.routes", uiState.routes);
    },
    getLastRoute(fragment: string) {
        if (!fragment) return undefined;
        const needle = fragment.toLowerCase();
        for (let i = uiState.routes.length - 1; i >= 0; i--) {
            const route = uiState.routes[i] as string;
            if (route.toLowerCase().includes(needle)) return route;
        }
        return undefined;
    },
    getLastRouteSmart() {
        const currentRoute = uiState.routes[uiState.routes.length - 1];
        let redirectTo = null;
        
        if (currentRoute.includes("dialogs/person")) {
            console.log("i am in a person dialog", uiState.routes);
            // check if the last module was sales or persons 
            const lastModule = this.getLastRoute("modules");
            console.log("lastModule", lastModule);
            if (lastModule?.includes("modules/persons"))
                redirectTo = lastModule;
            if (lastModule?.includes("modules/sales")) {
                // routing was sales > personOverview => return to sale 
                console.log("return to sale", this.getLastRoute("dialogs/sale/"));
                redirectTo = this.getLastRoute("dialogs/sale/");
            }
        }
        
        if (currentRoute.includes("modules/calendar") || currentRoute.includes("modules/personChooser"))
            redirectTo = this.getLastRoute("modules/sale");
        
        if(!redirectTo)
            redirectTo = this.getLastRoute("modules");
        
        if(redirectTo === currentRoute)
            return null;
        return redirectTo;
    }
});