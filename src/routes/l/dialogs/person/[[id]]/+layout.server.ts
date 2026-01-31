import type {LayoutServerLoad} from "../../../../../../.svelte-kit/types/src/routes/$types";

export const load: LayoutServerLoad = async ({params}) => {
    const id = params.id;
    return {id};
};
