import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { IpgeolocationService } from './ipgeolocation.service';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private dbPath = '/Comments';
  commentRef: AngularFirestoreCollection<Comment>;

  constructor(private db: AngularFirestore, private sanitizer: DomSanitizer, private ipGeoLocationService: IpgeolocationService) {
    this.commentRef = db.collection(this.dbPath, ref=> ref.orderBy('timestamp','desc'));
  }

  getAll(): AngularFirestoreCollection<Comment> {
    return this.commentRef;
  }
  addComment(comment: Comment): void {
    this.commentRef.add({ ...comment });
  }

  comment(name: string, comment: string) {
    try {
      this.ipGeoLocationService.getIP().subscribe((IPData: any) => {
        const newComment: Comment = {
          name: name,
          comment: comment,
          timestamp: new Date(),
          ip: IPData.ip_address,
          country: IPData.country,
          city: IPData.city,
          show: true
        };
        this.addComment(newComment);
      });
    } catch (e) {
      const newComment: Comment = {
        name: name,
        comment: comment,
        timestamp: new Date(),
        city: 'unknown',
        country: 'unknown',
        ip: 'unknown',
        show: true
      };
      this.addComment(newComment);
    }

  }
  toogleHiddenComment(comment:any){
    this.commentRef.doc(comment.id.toString()).update({show:!comment.show})
  }

}
