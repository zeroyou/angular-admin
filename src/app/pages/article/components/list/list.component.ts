import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';
import { ModalDirective } from 'ng2-bootstrap';
import { ArticleListService } from './list.service';
import { ArticleTagService } from '../tag/tag.service';
import { ArticleCategoryService } from '../category/category.service';

@Component({
  selector: 'article-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./list.html'),
  styles: [require('./list.scss')]
})
export class ArticleList {

  @ViewChild('delModal') delModal: ModalDirective;

  // 搜索参数
  public searchForm:FormGroup;
  public keyword:AbstractControl;
  public getParams:any = {
    state: 'all',
    tag: 'all',
    category: 'all'
  };

  // 初始化数据
  public tags = { data: [] };
  public categories = { data: [] };
  public articles = { 
    data: [],
    pagination: {
      current_page: 1,
      total_page: 0,
      per_page: 10,
      total: 0
    }
  };

  // 其他数据
  public del_article:any;
  public articlesSelectAll:boolean = false;
  public selectedArticles = [];

  constructor(private _fb:FormBuilder,
              private _articleTagService:ArticleTagService,
              private _articleListService:ArticleListService,
              private _articleCategoryService:ArticleCategoryService,
              private _notificationsService: NotificationsService) {

    this.searchForm = _fb.group({
      'keyword': ['', Validators.compose([Validators.required])]
    });

    this.keyword = this.searchForm.controls['keyword'];
  }

  // 初始化
  ngOnInit() {
    this.getTags();
    this.getArticles();
    this.getCategories();
  }

  // 文章列表多选切换
  public batchSelectChange(is_select): void {
    if(!this.articles.data.length) return;
    this.selectedArticles = [];
    this.articles.data.forEach(item => { 
      item.selected = is_select;
      is_select && this.selectedArticles.push(item._id);
    });
  }

  // 文章列表单个切换
  public itemSelectChange(): void {
    this.selectedArticles = [];
    const articles = this.articles.data;
    articles.forEach(item => { 
      item.selected && this.selectedArticles.push(item._id);
    });
    if(!this.selectedArticles.length) {
      this.articlesSelectAll = false;
    }
    if(!!this.selectedArticles.length && this.selectedArticles.length == articles.length) {
      this.articlesSelectAll = true;
    }
  }

  // 分类级别标记
  public categoryLevelMark(level): void { 
    return Array.from({ length: level }, () => '')
  };

  // 分类级别递归排序
  public categoryLevelBuild(): void {

    // 初始化数据
    let categories = Array.from(this.categories.data);
    let toDoDeletes = [];

    // 级别数据构造
    categories.forEach(cate => {
      // 找到问题数据并添加标记
      cate.unrepaired = (!!cate.pid && !categories.find(c => Object.is(cate.pid, c._id)))
      categories.forEach(c => {
        if(Object.is(cate.pid, c._id)) {
          c.children = c.children || [];
          c.children.push(cate);
          toDoDeletes.push(cate);
        }
      })
    });

    // 扁平数据构造（同时添加级别标示）
    const levelBuildRun = cates => {
      let newCategories = [];
      const levelBuildOptimize = (cates, level) => {
        cates.forEach(c => {
          c.level = level;
          newCategories.push(c);
          if(c.children && c.children.length) levelBuildOptimize(c.children, level + 1);
        })
      }
      levelBuildOptimize(cates, 0);
      return newCategories;
    }

    // 开始执行
    this.categories.data = levelBuildRun(categories.filter(c => !toDoDeletes.includes(c)));
  };

  // 切换文章类型
  public switchState(state:any):void {
    if(state == undefined || Object.is(state, this.getParams.state)) return;
    this.getParams.state = state;
    this.getArticles();
  }

  // 提交搜索
  public searchArticles(values: Object): void {
    if (this.searchForm.valid) {
      this.getArticles();
    }
  }

  // 清空搜索条件
  public resetGetParams(): void {
    this.searchForm.reset({
      keyword: ''
    });
    this.getParams.tag = 'all';
    this.getParams.category = 'all';
  }

  // 刷新文章列表
  public refreshArticles(): void {
    this.getArticles({ page: this.articles.pagination.current_page });
  }

  // 分页获取标签
  public pageChanged(event:any):void {
    this.getArticles({ page: event.page });
  }

  // 获取文章列表
  public getArticles(params:any = {}): void {
    // 如果没有搜索词，则清空搜索框
    if(!!this.keyword.value) {
      params.keyword = this.keyword.value;
    }
    // 如果请求的是全部数据，则优化参数
    Object.keys(this.getParams).forEach(key => {
      if(!Object.is(this.getParams[key], 'all')) {
        params[key] = this.getParams[key];
      }
    })
    // 如果请求的是第一页，则设置翻页组件的当前页为第一页
    if(!params.page || Object.is(params.page, 1)) {
      this.articles.pagination.current_page = 1;
    }
    console.log(params);
    this._articleListService.getArticles(params)
    .then(articles => {
      this.articles = articles.result;
    })
    .catch(error => {});
  }

  // 获取标签列表
  public getTags(): void {
    this._articleTagService.getTags({})
    .then(tags => {
      this.tags = tags.result;
    })
    .catch(error => {});
  }

  // 获取分类列表
  public getCategories(): void {
    this._articleCategoryService.getCategories()
    .then(categories => {
       this.categories = categories.result;
       this.categoryLevelBuild();
    });
  }
}
