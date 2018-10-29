/**
 * @file 文章编辑页面分类选择组件
 * @module app/page/article/componennt/category
 * @author Surmon <https://github.com/surmon-china>
 */

import { Component, ViewEncapsulation, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { SaHttpRequesterService } from '@app/services';

@Component({
  selector: 'box-article-edit-category',
  encapsulation: ViewEncapsulation.None,
  template: require('./category.html'),
  styles: [require('./category.scss')]
})

export class ArticleEditCategoryComponent implements OnInit, OnChanges {

  @Input() category;
  @Output() categoryChange: EventEmitter<any> = new EventEmitter();

  public categories = { data: [] };

  constructor(private _httpService: SaHttpRequesterService) {}

  ngOnInit() {
    this.getCategories();
  }

  ngOnChanges(changes) {
    if (changes.category) {
      this.categoryLevelBuild();
    }
  }

  // 分类级别标记
  public categoryLevelMark(level): any {
    return Array.from({ length: level }, () => '');
  }

  // 分类级别递归排序,同时构造勾选
  public categoryLevelBuild(): void {

    // 初始化数据
    const categories = Array.from(this.categories.data);
    const toDoDeletes = [];

    // 级别数据构造
    categories.forEach(cate => {
      // 找到问题数据并添加标记
      cate.unrepaired = (!!cate.pid && !categories.find(c => Object.is(cate.pid, c._id)));
      categories.forEach(c => {
        if (Object.is(cate.pid, c._id)) {
          c.children = c.children || [];
          c.children.push(cate);
          toDoDeletes.push(cate);
        }
      });
    });

    // 扁平数据构造（同时添加级别标示）
    const levelBuildRun = cates => {
      const newCategories = [];
      const levelBuildOptimize = (_cates, level) => {
        _cates.forEach(child => {
          child.level = level;
          newCategories.push(child);
          child.checked = this.category.indexOf(child._id) > -1;
          if (child.children && child.children.length) { levelBuildOptimize(child.children, level + 1); }
        });
      };
      levelBuildOptimize(cates, 0);
      return newCategories;
    };

    // 开始执行
    this.categories.data = levelBuildRun(categories.filter(c => toDoDeletes.indexOf(c) === -1));
  }

  // 勾选动作
  public itemSelectChange(checked, category) {
    const cateIndex = this.category.indexOf(category._id);
    const hasCate = !Object.is(cateIndex, -1);
    if (checked) {
      if (!hasCate) {
        this.category.push(category._id);
      }
    } else {
      if (hasCate) {
        this.category.splice(cateIndex, 1);
      }
    }
    this.categoryChange.emit(this.category);
  }

  // 获取所有分类
  public getCategories() {
    this._httpService.get('/category')
    .then(categories => {
      this.categories = categories.result;
      this.categoryLevelBuild();
    })
    .catch(error => {});
  }
}
