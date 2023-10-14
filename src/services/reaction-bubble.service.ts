import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionBubbleService {

  constructor(
    public authService: AuthenticationService,
  ) { }

  replaceNameWithDu(react_userIDs, moreThen3Reactions) {
    const names_react_user = this.switchIDsWithNames(react_userIDs);
    const sortedNames = this.sortNamesWithDuFirst(names_react_user);
    if (moreThen3Reactions) {
      return sortedNames.slice(0, 2);
    } else {
      return sortedNames;
    }
  }


  switchIDsWithNames(react_userIDs) {
    const names_react_user = [];
    react_userIDs.forEach(react_userID => {
      if (react_userID === this.authService.userData.uid) {
        names_react_user.push('Du')
      } else {
        names_react_user.push(this.authService.getUserInfo(react_userID).user_name)
      }
    });
    return names_react_user;
  }


  sortNamesWithDuFirst(names: string[]): string[] {
    const sortedNames = names.slice();
    const duIndex = sortedNames.findIndex(name => name.includes('Du'));
    if (duIndex !== -1) {
      const duName = sortedNames.splice(duIndex, 1)[0];
      sortedNames.unshift(duName);
    }
    return sortedNames;
  }

}
