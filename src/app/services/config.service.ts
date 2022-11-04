import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private collection = '/CommentsConfig';
  private document = '/config';
  configRef: AngularFirestoreDocument<any>;
  config: Map<string, string>=new Map<string, string>;
  
  constructor(private db: AngularFirestore) {
    this.configRef = db.collection(this.collection).doc(this.document);
  }
  retrieveConfigs() {
    this.configRef.snapshotChanges().pipe(map(data => data.payload.data().config)).subscribe((data: any) => {
      this.config =new Map(Object.entries(data));
    });
  }
  getConfig(key:string):string{
      if(this.config.has(key) && this.config.get(key)!=undefined )
        return this.config.get(key)!;
    return '';
  }


}
