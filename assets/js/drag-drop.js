const { createApp } = Vue;

createApp({
   data() {
      return {
         loading: false,
         formFields: [],
         selected: null,
         dragSource: null,
         draggedType: null,
         dragOverIndex: null,
         dragOverColumn: { container: null, column: null },
      };
   },
   mounted() {
      const saved = localStorage.getItem("vueFormBuilder");
      if (saved) {
         this.formFields = JSON.parse(saved);
      }
   },
   methods: {
      externalDragStart(type) {
         this.draggedType = type;
         this.dragSource = null;
      },
      dragStart(sourceType, formIndex, colIndex = null, fieldIndex = null) {
         this.draggedType = null;
         this.dragSource = {
            sourceType,
            formIndex,
            colIndex,
            fieldIndex,
         };
      },
      onDragOver(index) {
         this.dragOverIndex = index;
      },
      isDragOver(index) {
         return this.dragOverIndex === index;
      },
      onDragLeave() {
         this.dragOverIndex = null;
         this.dragOverColumn = { container: null, column: null };
      },
      isColumnDragOver(container, column) {
         return (
            this.dragOverColumn.container === container &&
            this.dragOverColumn.column === column
         );
      },
      removeField(index) {
         this.formFields.splice(index, 1);
         if (this.selected === this.formFields[index]) {
            this.selected = null;
         }
      },
      removeNestedField(containerIndex, columnIndex, fieldIndex) {
         const column = this.formFields[containerIndex].columns[columnIndex];
         column.fields.splice(fieldIndex, 1);
         this.selected = null;
      },
      dropOnForm(index) {
         if (this.draggedType) {
            const newField = this.createField(this.draggedType);
            if (index === null || index === undefined) {
               this.formFields.push(newField);
            } else {
               this.formFields.splice(index, 0, newField);
            }
         } else if (this.dragSource?.sourceType === "form") {
            const moved = this.formFields.splice(
               this.dragSource.formIndex,
               1
            )[0];
            const insertAt = index !== null ? index : this.formFields.length;
            this.formFields.splice(insertAt, 0, moved);
         }
         this.resetDrag();
      },
      dropInColumn(containerIndex, columnIndex) {
         const container = this.formFields[containerIndex];
         const column = container.columns[columnIndex];

         if (this.draggedType) {
            column.fields.push(this.createField(this.draggedType));
         } else if (this.dragSource?.sourceType === "column") {
            const fromCol =
               this.formFields[this.dragSource.formIndex].columns[
                  this.dragSource.colIndex
               ];
            const field = fromCol.fields.splice(
               this.dragSource.fieldIndex,
               1
            )[0];
            column.fields.push(field);
         }
         this.resetDrag();
      },
      createField(type) {
         return type === "container"
            ? {
                 type: "container",
                 columns: [{ fields: [] }, { fields: [] }],
              }
            : {
                 type,
                 label: this.capitalize(type),
                 placeholder: type === "checkbox" ? "" : `Enter ${type}`,
              };
      },
      capitalize(txt) {
         return txt.charAt(0).toUpperCase() + txt.slice(1);
      },
      selectField(field) {
         this.selected = field;
      },
      saveForm() {
         try {
            this.loading = true;
            localStorage.setItem(
               "vueFormBuilder",
               JSON.stringify(this.formFields)
            );
         } catch {
            console.warn("Something went wrong.");
         } finally {
            setTimeout(() => {
               this.loading = false;
            }, 500);
         }
      },
      resetDrag() {
         this.draggedType = null;
         this.dragSource = null;
         this.dragOverIndex = null;
         this.dragOverColumn = { container: null, column: null };
      },
   },
}).mount("#app");
