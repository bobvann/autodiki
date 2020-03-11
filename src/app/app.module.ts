import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MyDatePickerModule } from 'mydatepicker';
import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MyDatePickerModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
