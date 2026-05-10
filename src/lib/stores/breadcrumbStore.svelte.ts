class BreadcrumbStore {
    /** The detail label for the current dialog page (e.g. person name, article title). */
    detailLabel: string = $state('');
}

export const breadcrumbStore = new BreadcrumbStore();
