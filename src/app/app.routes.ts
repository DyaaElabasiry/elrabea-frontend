import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PatientsComponent } from './features/patients/patients.component';
import { MaterialsComponent } from './features/materials/materials.component';
import { SessionsComponent } from './features/sessions/sessions.component';
import { OperationsComponent } from './features/operations/operations.component';

export const routes: Routes = [
    
        
            { path: '', redirectTo: 'patients', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'patients', component: PatientsComponent },
            { path: 'materials', component: MaterialsComponent },
            { path: 'sessions', component: SessionsComponent },
            { path: 'operations/:patientId/:patientName', component: OperationsComponent },
            { path: 'sessions/:operationId/:patientName/:operationName', component: SessionsComponent },
        
    
    // Redirect any other path to home
    { path: '**', redirectTo: '' }
];
