import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface FieldConfig {
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  control?: FormControl | FormArray;
  isRequired?: boolean;
}

@Component({
  selector: 'app-dynamic-form-builder',
  templateUrl: './dynamic-form-builder.component.html',
  styleUrls: ['./dynamic-form-builder.component.css']
})
export class DynamicFormBuilderComponent {
  dynamicForm: FormGroup;
  fields: FieldConfig[] = [];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.dynamicForm = this.fb.group({});
  }

  addField(type: string): void {
    let newField: FieldConfig;

    switch (type) {
      case 'text':
        newField = {
          type,
          label: 'Your Name',
          placeholder: 'Enter your name',
          control: new FormControl('', Validators.required),
          isRequired: true
        };
        break;

      case 'textarea':
        newField = {
          type,
          label: 'Tell Me About Yourself',
          placeholder: 'Write about yourself',
          control: new FormControl('', Validators.required),
          isRequired: true
        };
        break;

      case 'dropdown':
        newField = {
          type,
          label: 'Select Your Country',
          options: ['India', 'Australia', 'USA'],
          control: new FormControl('', Validators.required),
          isRequired: true
        };
        break;

      case 'checkbox':
        newField = {
          type,
          label: 'Your Hobbies',
          options: ['Singing', 'Coding', 'Music'],
          control: this.fb.array([], Validators.required),
          isRequired: true
        };
        newField.options?.forEach(() => {
          (newField.control as FormArray).push(new FormControl(false));
        });
        break;

      case 'radio':
        newField = {
          type,
          label: 'Gender',
          options: ['Male', 'Female', 'Other'],
          control: new FormControl('', Validators.required),
          isRequired: true
        };
        break;

      default:
        return;
    }

    this.fields.push(newField);
    this.dynamicForm.addControl(newField.label, newField.control!);
  }

  removeField(index: number): void {
    const field = this.fields[index];
    this.fields.splice(index, 1);
    this.dynamicForm.removeControl(field.label);
  }

  getFormArray(field: FieldConfig): FormArray {
    return this.dynamicForm.get(field.label) as FormArray;
  }

  onCheckboxChange(field: FieldConfig, index: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.getFormArray(field).at(index).setValue(checkbox.checked);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dynamicForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(field: FieldConfig): string {
    const control = this.dynamicForm.get(field.label);
    if (control && control.errors) {
      if (control.errors['required']) {
        return `${field.label} is required`;
      }
    }
    return '';
  }

  onSubmit(): void {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });

    if (this.dynamicForm.valid) {
      const formValue = { ...this.dynamicForm.value };
      
      this.fields.forEach(field => {
        if (field.type === 'checkbox' && field.options) {
          const selectedOptions = field.options.filter((_, index) => 
            (this.dynamicForm.get(field.label) as FormArray).at(index).value
          );
          formValue[field.label] = selectedOptions;
        }
      });

      this.snackBar.open('Form Submitted Successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      console.log('Form Submitted', formValue);
      this.dynamicForm.reset();
      this.fields = [];
    } else {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }
}