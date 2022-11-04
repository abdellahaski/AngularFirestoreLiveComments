import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfigService } from '../services/config.service';
import { sha512 } from 'js-sha512';
import { CommentService } from '../services/comment.service';
import { map } from 'rxjs';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  isSent: boolean = false;
  isModerator: boolean = false;
  showModeratorForm: boolean = false;
  showModPasswordLoading: boolean = false;
  showHiddenComments: boolean = false;
  commentsCount: number = 0;
  comments: any[] = [];
  showInfoFor: string[] = [];
  commentForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  moderatorForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });
  preview: string = '';

  page: number = 1;
  count: number = 0;
  tableSize: number = 10;

  constructor(private configService: ConfigService, private commentService: CommentService) { }

  ngOnInit(): void {
    this.configService.retrieveConfigs();
    this.retrieveComments();

  }
  get f() {
    return this.commentForm.controls;
  }
  get fmod() {
    return this.moderatorForm.controls;
  }
  save() {
    this.preview = JSON.stringify(this.commentForm.value);
    this.isSent = true;
    this.commentForm.disable();
    this.commentService.comment(this.commentForm.value.name!, this.commentForm.value.comment!);
    setTimeout(() => {
      this.isSent = false;
      this.commentForm.reset();
      this.commentForm.enable();
    }, 5000);
  }
  nameChange(name: any) {
    this.showModeratorForm = name == 'moderator'
  }

  moderatorFormSubmit() {
    console.log(this.moderatorForm.controls);



    if (this.moderatorForm.valid && this.moderatorForm.value && this.moderatorForm.value.password && this.moderatorForm.value.password != '') {
      const entredPassword: string = this.moderatorForm.value.password;
      const hashedPassword = this.configService.getConfig('hashedPassword');
      

      console.log(hashedPassword);
      this.showModPasswordLoading = true;
      this.moderatorForm.disable();

      setTimeout(() => {

        if (entredPassword && entredPassword != undefined && sha512(entredPassword) == hashedPassword) {
          console.log('ok');
          this.isModerator = true;
          this.showModPasswordLoading = false;
        }
        else {
          console.log(this.moderatorForm.valid);
          this.moderatorForm.enable();
          this.moderatorForm.controls.password.setErrors({ 'incorrect': true });
          this.showModPasswordLoading = false;

        }
      }, 1000);
    }

  

  }

  retrieveComments(): void {
    this.commentService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.comments = data;

      this.countComments();


    });
  }
  countComments(): void {
    setTimeout(() => {
      this.commentsCount = (this.showHiddenComments && this.isModerator) ? this.comments.length : this.comments.filter(comment => { return comment.show }).length;

    }, 100);
  }

  onCommentShowChange($event: any, comment: Comment) {
    if (this.isModerator) {
      console.log($event);
      console.log(comment);
      this.commentService.toogleHiddenComment(comment);


    }
  }

  showInfo(id: string) {
    this.showInfoFor.includes(id) ? this.showInfoFor.splice(this.showInfoFor.indexOf(id), 1) : this.showInfoFor.push(id);
  }

  test(value: any) {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
      const intervals: any = {
        'year': 31536000,
        'month': 2592000,
        'week': 604800,
        'day': 86400,
        'hour': 3600,
        'minute': 60,
        'second': 1
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0)
          if (counter === 1) {
            return counter + ' ' + i + ' ago'; // singular (1 day ago)
          } else {
            return counter + ' ' + i + 's ago'; // plural (2 days ago)
          }
      }
    }
    return value;
  }


  onTableDataChange(event:any){
    this.page = event;
  }  


}
