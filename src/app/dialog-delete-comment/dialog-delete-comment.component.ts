import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete-comment',
  templateUrl: './dialog-delete-comment.component.html',
  styleUrls: ['./dialog-delete-comment.component.scss']
})
export class DialogDeleteCommentComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogDeleteCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { comment: string }
  ) { }


  onNoClick(): void {
    this.dialogRef.close();
  }
}
