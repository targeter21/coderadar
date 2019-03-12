import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../service/user.service';
import {ProjectService} from '../../service/project.service';
import {Commit} from '../../model/commit';
import {FORBIDDEN} from 'http-status-codes';

@Component({
  selector: 'app-view-commit',
  templateUrl: './view-commit.component.html',
  styleUrls: ['./view-commit.component.css']
})
export class ViewCommitComponent implements OnInit {

  commit: Commit = new Commit();
  metrics = '';
  projectId;

  constructor(private router: Router, private userService: UserService,
              private projectService: ProjectService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.commit.name = params.name;
      this.projectId = params.id;
      this.getCommitInfo();
    });
  }

  getCommitInfo() {
    this.projectService.getCommitsMetricValues(this.projectId, this.commit.name,
      [
      'ImportOrder',
      'FileLength',
      'EqualsHashCode',
      'EmptyStatement',
      'UnusedImports'])
        .then(response => this.metrics = JSON.stringify(response.body))
        .catch(e => {
          if (e.status && e.status === FORBIDDEN) {
              this.userService.refresh().then( (() => this.getCommitInfo()));
          }
    });
  }
}
