import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import updateAccounts from '@salesforce/apex/AccountController.updateAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Account Name', fieldName: 'Name', sortable: true },
    { label: 'Phone Number', fieldName: 'Phone' },
    { label: 'Last Modified By', fieldName: 'LastModifiedBy.Name', sortable: true }
];

export default class AccountTables extends LightningElement {
    columns = COLUMNS;

    
    allAccounts = [];
    @track accountsLevel1 = [];
    @track accountsLevel2 = [];
    @track selectedAccounts = [];

    
    filterName = '';
    filterPhone = '';
    filterOwner = '';

   
    sortBy = 'Name';
    sortDirection = 'asc';

    
    page = 1;
    pageSize = 5;

    
    @track isLoading = false;

    
    wiredAccountsResult;
    @wire(getAccounts)
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        if (result.data) {
            this.allAccounts = result.data;
            this.applyFilters();
        } else if (result.error) {
            console.error(result.error);
        }
    }

   
    applyFilters() {
        let filtered = [...this.allAccounts];

        if (this.filterName) {
            filtered = filtered.filter(acc =>
                acc.Name && acc.Name.toLowerCase().includes(this.filterName)
            );
        }
        if (this.filterPhone) {
            filtered = filtered.filter(acc =>
                acc.Phone && acc.Phone.includes(this.filterPhone)
            );
        }
        if (this.filterOwner) {
            filtered = filtered.filter(acc =>
                acc.OwnerId === this.filterOwner
            );
        }

        
        filtered = this.sortData(filtered);

        
        this.accountsLevel1 = filtered.filter(acc => acc.Level__c === 'Level 1');
        this.accountsLevel2 = filtered.filter(acc => acc.Level__c === 'Level 2');
    }

    
    sortData(data) {
        const sortBy = this.sortBy;
        const direction = this.sortDirection === 'asc' ? 1 : -1;
        return [...data].sort((a, b) => {
            let valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
            let valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';
            return valA > valB ? direction : valA < valB ? -direction : 0;
        });
    }

    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.applyFilters();
    }

    
    handleFilterChange(event) {
        const field = event.target.name;
        if (field === 'name') {
            this.filterName = event.target.value.toLowerCase();
        } else if (field === 'phone') {
            this.filterPhone = event.target.value;
        } else if (field === 'owner') {
            this.filterOwner = event.target.value;
        }
        this.applyFilters();
    }

    
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedAccounts = selectedRows.map(row => row.Id);
    }

    
    handleUpdateAccounts() {
    if (this.selectedAccounts.length === 0) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: 'Debe seleccionar al menos una cuenta.',
            variant: 'error'
        }));
        return;
    }

    this.isLoading = true; 

    
    setTimeout(() => {
        updateAccounts({ accountIds: this.selectedAccounts })
            .then(messages => {
                messages.forEach(msg => {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Resultado',
                        message: msg,
                        variant: msg.startsWith('✅') ? 'success' : 'error'
                    }));
                });
                this.selectedAccounts = [];
                return refreshApex(this.wiredAccountsResult);
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Ocurrió un problema al actualizar.',
                    variant: 'error'
                }));
            })
            .finally(() => {
                this.isLoading = false; 
            });
    }, 2000); 
}


    
    get totalPagesLevel1() {
        return Math.ceil(this.accountsLevel1.length / this.pageSize);
    }
    get paginatedLevel1() {
        const start = (this.page - 1) * this.pageSize;
        return this.accountsLevel1.slice(start, start + this.pageSize);
    }

    get totalPagesLevel2() {
        return Math.ceil(this.accountsLevel2.length / this.pageSize);
    }
    get paginatedLevel2() {
        const start = (this.page - 1) * this.pageSize;
        return this.accountsLevel2.slice(start, start + this.pageSize);
    }

    nextPage() {
        this.page++;
        if (this.page > this.totalPagesLevel1 && this.page > this.totalPagesLevel2) {
            this.page--;
        }
    }
    prevPage() {
        if (this.page > 1) {
            this.page--;
        }
    }
}








