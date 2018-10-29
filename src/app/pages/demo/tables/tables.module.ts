import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaModule } from '@/app/sa.module';

import { routing } from './tables.routing';
import { TablesComponent } from './tables.component';
import { BasicTablesComponent } from './components/basicTables/basicTables.component';
import { BasicTablesService } from './components/basicTables/basicTables.service';
import { ResponsiveTable } from './components/basicTables/components/responsiveTable';
import { StripedTable } from './components/basicTables/components/stripedTable';
import { BorderedTable } from './components/basicTables/components/borderedTable';
import { HoverTable } from './components/basicTables/components/hoverTable';
import { CondensedTable } from './components/basicTables/components/condensedTable';
import { ContextualTable } from './components/basicTables/components/contextualTable';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SaModule,
    routing
  ],
  declarations: [
    TablesComponent,
    BasicTablesComponent,
    HoverTable,
    BorderedTable,
    CondensedTable,
    StripedTable,
    ContextualTable,
    ResponsiveTable
  ],
  providers: [
    BasicTablesService,
  ]
})
export default class TablesModule {}
