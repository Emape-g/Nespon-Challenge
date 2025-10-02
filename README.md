# Nespon Challenge - Salesforce 

Este proyecto es la resolución del desafío técnico solicitado por Nespon Solutions.  
Consiste en un componente Lightning Web Component que muestra cuentas de Salesforce separadas en dos tablas según su nivel (`Level__c`), mostrándolas dentro de una Lightning Page en formato App Page.


# Funcionalidad
- Muestra cuentas en dos tablas: **Level 1** y **Level 2**.  
- Incluye filtros por **Name**, **Phone** y **Owner**.  
- Permite **ordenar** por Name y LastModifiedDate.  
- Implementa **paginación** para mejorar la usabilidad.  
- Botón **Update Account Level**:
  - Cambia las cuentas seleccionadas de Level 1 → Level 2 y viceversa.  
  - **Validaciones de negocio**:
    -  No permite cambiar si la cuenta tiene oportunidades con Stage = "Closed Won".  
    -  No permite bajar de Level 2 a Level 1 si el Type = "Customer - Direct".  
- Muestra notificaciones tipo **toast** con los resultados.  
- Incluye **spinner** de carga y confirmación visual.
