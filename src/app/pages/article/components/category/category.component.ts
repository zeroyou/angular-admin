/**
 * @file 分类页面组件
 * @module app/page/article/componennt/category
 * @author Surmon <https://github.com/surmon-china>
 */

import { ModalDirective } from 'ngx-bootstrap';
import { Component, ViewChild, OnInit } from '@angular/core';
import { SaHttpRequesterService } from '@app/services';

@Component({
  selector: 'page-article-category',
  template: require('./category.html'),
})
export class ArticleCategoryComponent implements OnInit {

  @ViewChild('delModal') delModal: ModalDirective;

  private _apiPath = '/category';

  public categories = { data: [] };
  public addCategoryState = { ing: false, success: false };
  public delCategory: any;
  public editCategory: any;
  public delCategories: any;

  constructor(private _httpService: SaHttpRequesterService) {}

  ngOnInit() {
    this._getCategories();
  }

  // 分类级别递归排序
  private _categoryLevelBuild = () => {

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
      const levelBuildOptimize = (child, level) => {
        child.forEach(c => {
          c.level = level;
          newCategories.push(c);
          if (c.children && c.children.length) { levelBuildOptimize(c.children, level + 1); }
        });
      };
      levelBuildOptimize(cates, 0);
      return newCategories;
    };

    // 开始执行
    this.categories.data = levelBuildRun(categories.filter(c => toDoDeletes.indexOf(c) === -1));
  }

  // 获取分类
  private _getCategories() {
    this._httpService.get(this._apiPath, { per_page: 100 })
    .then(categories => {
      this.categories = categories.result;
      this._categoryLevelBuild();
    });

  }

  // 添加分类
  private _addCategory(category) {
    this.addCategoryState = { ing: true, success: false };
    this._httpService.post(this._apiPath, category)
    .then(_category => {
      this._getCategories();
      this.addCategoryState = { ing: false, success: !!_category.code };
    });

  }

  // 修改分类
  private _putCategory(category) {
    this.editCategory = category;
  }

  // 确认修改分类
  private _doPutCategory(category) {
    this.addCategoryState = { ing: true, success: false };
    category = Object.assign(this.editCategory, category);
    this._httpService.put(`${ this._apiPath }/${ category._id }`, category)
    .then(result => {
      this._getCategories();
      this.editCategory = null;
      this.addCategoryState = { ing: false, success: !!result.code };
    })
    .catch(error => {
      this.addCategoryState = { ing: false, success: false };
    });
  }

  // 删除分类弹窗
  private _delCategory(category) {
    this.delCategory = category;
    this.delModal.show();
  }

  // 分类弹窗取消
  private _canceldDelCategory(category) {
    this.delCategory = null;
    this.delModal.hide();
  }

  // 确认删除分类
  private _doDelCategory() {
    this._httpService.delete(`${ this._apiPath }/${ this.delCategory._id }`)
    .then(category => {
      this.delCategory = null;
      this.delModal.hide();
      this._getCategories();
    })
    .catch(error => {
      this.delModal.hide();
    });
  }

  // 批量删除分类
  private _delCategories(categories) {
    this.delCategories = categories;
    this.delCategory = null;
    this.delModal.show();
  }

  // 确认批量删除
  private _doDelCategories() {
    this._httpService.delete(this._apiPath, { categories: this.delCategories })
    .then(categories => {
      this.delCategories = null;
      this.delModal.hide();
      this._getCategories();
    })
    .catch(error => {
      this.delModal.hide();
    });
  }
}
