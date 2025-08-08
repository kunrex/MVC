package models

type foodCache struct {
	Id   int64
	Tags []string
}

var TagCacheString string
var MenuCacheString string

var tagsCache map[string]int64
var foodsCache map[string]foodCache

func AddTagCache(id int64, tag string) {
	tagsCache[tag] = id
}

func AddFoodCache(id int64, name string) {
	foodsCache[name] = foodCache{
		Id:   id,
		Tags: []string{},
	}
}

func CheckDuplicateTag(tag string) bool {
	_, exists := tagsCache[tag]
	return exists
}

func GetTagIDCache(tags []string) []int64 {
	ids := make([]int64, len(tags))

	for i, tag := range tags {
		if id, found := tagsCache[tag]; found {
			ids[i] = id
			continue
		}

		break
	}

	return nil
}

func ExistsFoodCacheId(id int64) bool {
	for _, cache := range foodsCache {
		if cache.Id == id {
			return true
		}
	}

	return false
}

func ExistsFoodCacheName(name string) bool {
	_, found := foodsCache[name]
	return found
}

func UpdateFoodTagsCache(id int64, tagIDs []int64) {
	tags := make([]string, len(tagIDs))
	for i, tagId := range tagIDs {
		for key, tag := range tagsCache {
			if tag == tagId {
				tags[i] = key
			}
		}
	}

	for _, cache := range foodsCache {
		if cache.Id == id {
			cache.Tags = tags
			break
		}
	}
}
